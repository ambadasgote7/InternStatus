import mongoose from "mongoose";

import User from "../../models/User.js";
import StudentProfile from "../../models/StudentProfile.js";
import FacultyProfile from "../../models/FacultyProfile.js";
import MentorProfile from "../../models/MentorProfile.js";
import College from "../../models/College.js";
import Company from "../../models/Company.js";
import Application from "../../models/Application.js";
import StudentAcademicHistory from "../../models/StudentAcademicHistory.js";
import FacultyEmploymentHistory from "../../models/FacultyEmploymentHistory.js";
import MentorEmploymentHistory from "../../models/MentorEmploymentHistory.js";
import Internship from "../../models/Internship.js";
import InternshipReport from "../../models/InternshipReport.js";
import Task from "../../models/Task.js";
import TaskSubmission from "../../models/TaskSubmission.js";
import ProgressLog from "../../models/ProgressLog.js";
import CollegeOnboarding from "../../models/CollegeOnboarding.js";
import CompanyOnboarding from "../../models/CompanyOnboarding.js";

import sendEmail from "../../utils/sendEmail.js";

export const getDashboardService = async (user) => {
  switch (user.role) {
    case "student":
      return await getStudentDashboard(user._id);

    case "college":
      return await getCollegeDashboard(user._id);

    case "company":
      return await getCompanyDashboard(user._id);

    case "faculty":
      return await getFacultyDashboard(user._id);

    case "mentor":
      return await getMentorDashboard(user._id);

    case "admin":
      return await getAdminDashboard(user._id);

    default:
      throw new Error("Invalid role");
  }
};


export async function getStudentDashboard(userId) {
  // Step 1: Resolve StudentProfile from userId
  const profile = await StudentProfile.findOne({ user: userId })
    .select("_id profileStatus resumeUrl")
    .lean();

  if (!profile) throw new Error("Student profile not found");

  const studentId = profile._id;
  const today = new Date();

  // ─────────────────────────────────────────────
  // PARALLEL AGGREGATIONS
  // ─────────────────────────────────────────────
  const [
    applicationStats,
    ongoingApplication,
    taskStats,
    recentActivity,
    scoreStats,
    overdueTaskIds,
    completionRateData,
  ] = await Promise.all([
    // 1. APPLICATION PIPELINE STATS
    Application.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    // 2. CURRENT ONGOING INTERNSHIP
    Application.findOne({ student: studentId, status: "ongoing" })
      .populate("internship", "title durationMonths startDate")
      .populate("company", "name")
      .populate("mentor", "fullName")
      .select(
        "internship company mentor internshipStartDate internshipEndDate status"
      )
      .lean(),

    // 3. TASK ANALYTICS (for ongoing application)
    Application.aggregate([
      { $match: { student: studentId, status: "ongoing" } },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "application",
          as: "tasks",
        },
      },
      { $unwind: { path: "$tasks", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$tasks.status",
          count: { $sum: 1 },
        },
      },
    ]),

    // 4. RECENT ACTIVITY (last 5 submissions + last 5 status-relevant apps)
    TaskSubmission.find({ student: studentId })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate("task", "title")
      .select("task submittedAt status score")
      .lean(),

    // 5. SCORE STATS (avg + trend)
    TaskSubmission.aggregate([
      { $match: { student: studentId, score: { $exists: true, $ne: null } } },
      { $sort: { submittedAt: -1 } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" },
          trend: { $push: "$score" },
          latestFeedback: { $first: "$mentorFeedback" },
        },
      },
      {
        $project: {
          avgScore: { $round: ["$avgScore", 1] },
          trend: { $slice: ["$trend", 5] },
          latestFeedback: 1,
        },
      },
    ]),

    // 6. OVERDUE TASKS
    Task.find({
      status: { $in: ["assigned", "revision_requested"] },
      deadline: { $lt: today },
    })
      .populate({
        path: "application",
        match: { student: studentId },
        select: "_id",
      })
      .select("_id title deadline status application")
      .lean(),

    // 7. COMPLETION RATE from InternshipReport
    InternshipReport.findOne({ student: studentId })
      .sort({ createdAt: -1 })
      .select("completionRate tasksCompleted totalTasks")
      .lean(),
  ]);

  // ─────────────────────────────────────────────
  // PROCESS APPLICATION PIPELINE
  // ─────────────────────────────────────────────
  const pipeline = {
    applied: 0,
    shortlisted: 0,
    selected: 0,
    ongoing: 0,
    completed: 0,
    offer_accepted: 0,
    rejected: 0,
  };

  let totalApplications = 0;
  let completedInternships = 0;

  for (const stat of applicationStats) {
    const s = stat._id;
    totalApplications += stat.count;
    if (pipeline[s] !== undefined) pipeline[s] = stat.count;
    if (s === "completed") completedInternships = stat.count;
  }

  // ─────────────────────────────────────────────
  // PROCESS TASK ANALYTICS
  // ─────────────────────────────────────────────
  const taskMap = {
    assigned: 0,
    submitted: 0,
    under_review: 0,
    revision_requested: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const t of taskStats) {
    if (t._id && taskMap[t._id] !== undefined) taskMap[t._id] = t.count;
  }

  const totalTasks = Object.values(taskMap).reduce((a, b) => a + b, 0);
  const pendingTasksCount = taskMap.assigned + taskMap.revision_requested;

  // ─────────────────────────────────────────────
  // PROCESS OVERDUE TASKS
  // ─────────────────────────────────────────────
  const overdueTasks = overdueTaskIds
    .filter((t) => t.application !== null)
    .map((t) => ({
      taskId: t._id,
      title: t.title,
      deadline: t.deadline,
      status: t.status,
    }));

  // ─────────────────────────────────────────────
  // CURRENT INTERNSHIP + PROGRESS
  // ─────────────────────────────────────────────


  let currentInternship = null;

if (ongoingApplication) {
  const today = new Date();

  const start = new Date(ongoingApplication.internshipStartDate);
  const end = new Date(ongoingApplication.internshipEndDate);

  if (!start || !end) {
    throw new Error("Internship dates are not properly set");
  }

  // const totalDays = Math.max(
  //   Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
  //   1
  // );

  // const elapsedDays = Math.min(
  //   Math.max(
  //     Math.ceil((today - start) / (1000 * 60 * 60 * 24)),
  //     0
  //   ),
  //   totalDays
  // );

  // const progress = Math.round((elapsedDays / totalDays) * 100);

          /// Task progress calculation
    const completedTasks = taskMap.completed || 0;
const totalTasks = Object.values(taskMap).reduce((a, b) => a + b, 0) || 1;

const progress = Math.round((completedTasks / totalTasks) * 100);

  currentInternship = {
    applicationId: ongoingApplication._id,
    title: ongoingApplication.internship?.title || "N/A",
    company: ongoingApplication.company?.name || "N/A",
    startDate: start,
    endDate: end,
    mentor: ongoingApplication.mentor?.fullName || null,
    progress,
  };
}

  // ─────────────────────────────────────────────
  // PERFORMANCE
  // ─────────────────────────────────────────────
  const perf = scoreStats[0] || null;
  const averageScore = perf?.avgScore ?? null;
  const performance = {
    averageScore,
    latestFeedback: perf?.latestFeedback ?? null,
    trend: perf?.trend ?? [],
  };

  // ─────────────────────────────────────────────
  // RECENT ACTIVITY
  // ─────────────────────────────────────────────
  const recentSubmissions = recentActivity.map((s) => ({
    type: "submission",
    label: `Submitted: ${s.task?.title || "Task"}`,
    time: s.submittedAt,
    meta: { status: s.status, score: s.score ?? null },
  }));

  // ─────────────────────────────────────────────
  // ACTION QUEUE (DECISION ENGINE)
  // ─────────────────────────────────────────────
  const actionQueue = [];

  // Overdue tasks → highest priority
  for (const t of overdueTasks) {
    actionQueue.push({
      priority: "urgent",
      label: `Overdue: Submit "${t.title}"`,
      route: `/student/task/${t.taskId}`,
      meta: { deadline: t.deadline },
    });
  }

  // Revision requested
  if (taskMap.revision_requested > 0) {
    const revisionTask = await Task.findOne({
      status: "revision_requested",
    })
      .populate({
        path: "application",
        match: { student: studentId },
        select: "_id",
      })
      .select("_id title")
      .lean();

    if (revisionTask?.application) {
      actionQueue.push({
        priority: "high",
        label: `Revise task: "${revisionTask.title}"`,
        route: `/student/task/${revisionTask._id}`,
      });
    }
  }

  // Pending assigned tasks
  if (taskMap.assigned > 0) {
    actionQueue.push({
      priority: "normal",
      label: `${taskMap.assigned} task(s) pending submission`,
      route: currentInternship
        ? `/student/intern/${currentInternship.applicationId}/track`
        : "/student/my-applications",
    });
  }

  // Offer accepted but not started
  if (pipeline.offer_accepted > 0) {
    const offerApp = await Application.findOne({
      student: studentId,
      status: "offer_accepted",
    })
      .select("_id")
      .lean();

    if (offerApp) {
      actionQueue.push({
        priority: "high",
        label: "Accept offer — internship awaiting start",
        route: `/student/intern/${offerApp._id}/track`,
      });
    }
  }

  // Profile incomplete
  if (profile.profileStatus === "pending") {
    actionQueue.push({
      priority: "normal",
      label: "Complete your profile to apply for internships",
      route: "/student/profile",
    });
  }

  // ─────────────────────────────────────────────
  // FINAL RESPONSE
  // ─────────────────────────────────────────────
  return {
    kpi: {
      totalApplications,
      activeInternship: !!currentInternship,
      completedInternships,
      pendingTasksCount,
      averageScore,
      completionRate: completionRateData?.completionRate ?? null,
    },
    applicationPipeline: pipeline,
    currentInternship,
    taskAnalytics: {
      total: totalTasks,
      submitted: taskMap.submitted,
      pending: taskMap.assigned,
      under_review: taskMap.under_review,
      revision_requested: taskMap.revision_requested,
      completed: taskMap.completed,
      overdue: overdueTasks,
    },
    recentActivity: recentSubmissions,
    performance,
    actionQueue,
  };
}


// ─────────────────────────────────────────────────────────────────────
// COLLEGE DASHBOARD SERVICE
// ─────────────────────────────────────────────────────────────────────

export const getCollegeDashboard = async (userId) => {
  // Get college from user referenceId
  const user = await User.findById(userId).select("referenceId").lean();
  if (!user?.referenceId) throw new Error("College not found");

  const collegeId = user.referenceId;
  const today = new Date();
  const thirteenDaysAgo = new Date(today);
  thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 15);

  // ─────────────────────────────────────────────────────────────────────
  // PARALLEL AGGREGATIONS
  // ─────────────────────────────────────────────────────────────────────
  const [
    studentStats,
    facultyStats,
    applicationPipeline,
    specializationData,
    facultyPerformance,
    atRiskStudents,
    recentActivityData,
  ] = await Promise.all([
    // 1. STUDENT STATS
    StudentProfile.aggregate([
      { $match: { college: collegeId } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          activeStudents: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
        },
      },
    ]),

    // 2. FACULTY STATS (count)
    FacultyProfile.aggregate([
      { $match: { college: collegeId } },
      {
        $group: {
          _id: null,
          totalFaculty: { $sum: 1 },
          activeFaculty: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
        },
      },
    ]),

    // 3. APPLICATION PIPELINE
    Application.aggregate([
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student",
          foreignField: "_id",
          as: "studentData",
        },
      },
      { $unwind: "$studentData" },
      { $match: { "studentData.college": collegeId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
        },
      },
    ]),

    // 4. SPECIALIZATION STATS
    StudentProfile.aggregate([
      { $match: { college: collegeId } },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "student",
          as: "apps",
        },
      },
      {
        $group: {
          _id: "$specialization",
          totalStudents: { $sum: 1 },
          placedCount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    { $arrayElemAt: ["$apps.status", 0] },
                    ["completed", "ongoing"],
                  ],
                },
                1,
                0,
              ],
            },
          },
          avgScore: {
            $avg: {
              $cond: [
                { $arrayElemAt: ["$apps.evaluationScore", 0] },
                { $arrayElemAt: ["$apps.evaluationScore", 0] },
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          specialization: "$_id",
          total: "$totalStudents",
          placed: "$placedCount",
          placementRate: {
            $round: [
              { $multiply: [{ $divide: ["$placedCount", "$totalStudents"] }, 100] },
              1,
            ],
          },
          avgScore: { $round: ["$avgScore", 1] },
          _id: 0,
        },
      },
      { $sort: { placementRate: -1 } },
    ]),

    FacultyProfile.aggregate([
  { $match: { college: collegeId } },

  // 🔥 GET STUDENTS DIRECTLY (NEW LOGIC)
  {
    $lookup: {
      from: "studentprofiles",
      localField: "_id",
      foreignField: "faculty",
      as: "students",
    },
  },

  // 🔥 GET APPLICATIONS OF THOSE STUDENTS
  {
    $lookup: {
      from: "applications",
      let: { studentIds: "$students._id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$student", "$$studentIds"],
            },
          },
        },
      ],
      as: "applications",
    },
  },

  // 🔥 GET REPORTS
  {
    $lookup: {
      from: "internshipreports",
      let: { studentIds: "$students._id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $in: ["$student", "$$studentIds"],
            },
          },
        },
      ],
      as: "reports",
    },
  },

  // 🔥 FINAL CALCULATIONS
  {
    $addFields: {
      studentCount: { $size: "$students" },

      activeCount: {
        $size: {
          $filter: {
            input: "$applications",
            as: "app",
            cond: { $eq: ["$$app.status", "ongoing"] },
          },
        },
      },

      reportsApproved: {
        $size: {
          $filter: {
            input: "$reports",
            as: "r",
            cond: { $eq: ["$$r.facultyStatus", "approved"] },
          },
        },
      },
    },
  },

  {
    $project: {
      _id: 1,
      name: "$fullName",
      studentCount: 1,
      activeCount: 1,
      reportsApproved: 1,
      status: 1,
    },
  },

  { $sort: { studentCount: -1 } },
]),

    // 6. AT-RISK STUDENTS
    StudentProfile.aggregate([
      { $match: { college: collegeId, status: "active" } },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "student",
          as: "apps",
        },
      },
      {
        $addFields: {
          noInternship: { $eq: [{ $size: "$apps" }, 0] },
          oldestApp: { $min: "$apps.appliedAt" },
          latestScore: { $max: "$apps.evaluationScore" },
        },
      },
      {
        $match: {
          $or: [
            { noInternship: true },
            {
              $expr: {
                $lt: [
                  "$oldestApp",
                  new Date(thirteenDaysAgo),
                ],
              },
            },
            { latestScore: { $lt: 5 } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: "$fullName",
          noInternship: 1,
          oldestApp: 1,
          latestScore: 1,
        },
      },
      { $limit: 20 },
    ]),

    // 7. RECENT ACTIVITY
    Application.aggregate([
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student",
          foreignField: "_id",
          as: "studentData",
        },
      },
      { $unwind: "$studentData" },
      { $match: { "studentData.college": collegeId } },
      { $sort: { updatedAt: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          studentName: "$studentData.fullName",
          status: 1,
          updatedAt: 1,
        },
      },
    ]),
  ]);

  // ─────────────────────────────────────────────────────────────────────
  // PROCESS KPIs
  // ─────────────────────────────────────────────────────────────────────
  const studentData = studentStats[0] || { totalStudents: 0, activeStudents: 0 };
  const facultyData = facultyStats[0] || { totalFaculty: 0, activeFaculty: 0 };

  // Get internship counts
  const internshipCounts = await Application.aggregate([
    {
      $lookup: {
        from: "studentprofiles",
        localField: "student",
        foreignField: "_id",
        as: "student_info",
      },
    },
    { $unwind: "$student_info" },
    { $match: { "student_info.college": collegeId } },
    {
      $group: {
        _id: null,
        withInternships: {
          $sum: { $cond: [{ $gt: [1, 0] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
  ]);

  const internshipStats = internshipCounts[0] || {
    withInternships: 0,
    completed: 0,
  };

  // Get average scores
  const scoreData = await InternshipReport.aggregate([
    {
      $lookup: {
        from: "studentprofiles",
        localField: "student",
        foreignField: "_id",
        as: "student_info",
      },
    },
    { $unwind: "$student_info" },
    { $match: { "student_info.college": collegeId } },
    {
      $group: {
        _id: null,
        avgScore: { $avg: "$mentorScore" },
      },
    },
  ]);

  const avgScore = scoreData[0]?.avgScore ?? 0;

  const kpis = {
    totalStudents: studentData.totalStudents,
    activeStudents: studentData.activeStudents,
    studentsWithInternships: internshipStats.withInternships,
    completedInternships: internshipStats.completed,
    placementRate: studentData.totalStudents
      ? Math.round((internshipStats.completed / studentData.totalStudents) * 100)
      : 0,
    totalFaculty: facultyData.totalFaculty,
    activeFaculty: facultyData.activeFaculty,
    avgStudentScore: Math.round(avgScore * 10) / 10,
  };

  // ─────────────────────────────────────────────────────────────────────
  // PROCESS PIPELINE
  // ─────────────────────────────────────────────────────────────────────
  const pipeline = {
    applied: 0,
    shortlisted: 0,
    selected: 0,
    ongoing: 0,
    completed: 0,
    rejected: 0,
  };
  let totalApps = 0;

  for (const stat of applicationPipeline) {
    const status = stat._id;
    if (pipeline[status] !== undefined) {
      pipeline[status] = stat.count;
      totalApps += stat.count;
    }
  }

  const pipelineWithConversion = {
    ...pipeline,
    conversionRate: totalApps
      ? Math.round(
          ((pipeline.selected + pipeline.ongoing + pipeline.completed) /
            totalApps) *
            100
        )
      : 0,
  };

  // ─────────────────────────────────────────────────────────────────────
  // PROCESS AT-RISK
  // ─────────────────────────────────────────────────────────────────────
  const atRisk = atRiskStudents.map((student) => {
    let reason = "";
    if (student.noInternship) reason = "No internship applied";
    else if (student.latestScore && student.latestScore < 5)
      reason = `Low score: ${student.latestScore}/10`;
    else reason = "Applied > 15 days ago";

    return {
      id: student._id,
      name: student.name,
      reason,
    };
  });

  // ─────────────────────────────────────────────────────────────────────
  // PROCESS FACULTY STATS
  // ─────────────────────────────────────────────────────────────────────
  const facultyTop5 = facultyPerformance.slice(0, 5).map((f) => ({
    id: f._id,
    name: f.name,
    studentsCount: f.studentCount,
    activeInternships: f.activeCount,
    reportsApproved: f.reportsApproved,
  }));

  const facultyInactive = facultyPerformance
    .filter((f) => f.status === "inactive" || f.studentCount === 0)
    .map((f) => ({
      id: f._id,
      name: f.name,
      status: f.status,
    }));

  // ─────────────────────────────────────────────────────────────────────
  // PROCESS RECENT ACTIVITY
  // ─────────────────────────────────────────────────────────────────────
  const recentActivity = recentActivityData.map((activity) => ({
    type: "application_status",
    label: `${activity.studentName}: ${activity.status}`,
    time: activity.updatedAt,
  }));

  // ─────────────────────────────────────────────────────────────────────
  // ACTION QUEUE
  // ─────────────────────────────────────────────────────────────────────
  const actions = [];

  if (atRisk.length > 0) {
    actions.push({
      label: `Review ${atRisk.length} at-risk students`,
      route: "/college/at-risk",
      priority: "urgent",
    });
  }

  if (kpis.placementRate < 50) {
    actions.push({
      label: "Improve placement rate",
      route: "/college/students",
      priority: "high",
    });
  }

  actions.push(
    { label: "View All Students", route: "/college/students" },
    { label: "Manage Faculty", route: "/college/faculty" },
    { label: "Review Credits", route: "/college/credits" }
  );

  // ─────────────────────────────────────────────────────────────────────
  // FINAL RESPONSE
  // ─────────────────────────────────────────────────────────────────────
  return {
    kpis,
    pipeline: pipelineWithConversion,
    specializationStats: specializationData,
    facultyStats: {
      top5: facultyTop5,
      inactive: facultyInactive,
    },
    atRisk,
    recentActivity,
    actions,
  };
};



export const getFacultyDashboard = async (userId) => {
  const faculty = await FacultyProfile.findOne({ user: userId }).lean();
  if (!faculty) throw new Error("Faculty profile not found");

  const facultyId = faculty._id;
  const collegeId = faculty.college;

  // ---------------- ALL STUDENTS ----------------
  const allStudents = await StudentProfile.find({
    college: collegeId,
    status: "active"
  }).select("_id fullName").lean();

  // ---------------- APPLICATIONS ----------------
  const applications = await Application.find({
    $or: [
      { faculty: facultyId },
      { faculty: { $in: [null, undefined] } }
    ]
  })
    .populate("student", "fullName")
    .lean();

  const appIds = applications.map((a) => a._id);

  const appliedStudentSet = new Set(
    applications.map((a) => a.student?._id?.toString())
  );

  // ---------------- PIPELINE ----------------
  const statusGroups = {
    applied: 0,
    selected: 0,
    ongoing: 0,
    completed: 0
  };

  let activeInternships = 0;
  let completedInternships = 0;

  for (const app of applications) {
    if (statusGroups[app.status] !== undefined) {
      statusGroups[app.status]++;
    }

    if (app.status === "ongoing") activeInternships++;
    if (app.status === "completed") completedInternships++;
  }

  // ---------------- TASKS ----------------
  const tasks = await Task.find({
    application: { $in: appIds }
  })
    .select("status application")
    .lean();

  const totalTasks = tasks.length;

  const taskStatusMap = {
    submitted: 0,
    under_review: 0,
    revision_requested: 0,
    pending: 0
  };

  for (const t of tasks) {
    if (t.status === "assigned") taskStatusMap.pending++;
    else if (taskStatusMap[t.status] !== undefined)
      taskStatusMap[t.status]++;
  }

  // ---------------- COUNTS ----------------
  const pendingTaskReviews = await TaskSubmission.countDocuments({
    application: { $in: appIds },
    status: { $in: ["submitted", "under_review"] }
  });

  const pendingApprovals = await InternshipReport.countDocuments({
    application: { $in: appIds },
    facultyStatus: "pending"
  });

  // ---------------- SUBMISSIONS ----------------
  const submissions = await TaskSubmission.find({
    application: { $in: appIds }
  })
    .select("application score status submittedAt")
    .lean();

  const subByApp = {};
  for (const sub of submissions) {
    const key = sub.application.toString();
    if (!subByApp[key]) subByApp[key] = [];
    subByApp[key].push(sub);
  }

  // ---------------- STUDENT STATS ----------------
  const studentStats = applications.map((app) => {
    const subs = subByApp[app._id.toString()] || [];

    const appTasks = tasks.filter(
      (t) => t.application.toString() === app._id.toString()
    );

    const completed = subs.filter((s) => s.status === "approved").length;

    const completionPct = appTasks.length
      ? Math.round((completed / appTasks.length) * 100)
      : 0;

    const scores = subs.map((s) => s.score).filter((s) => s != null);

    const avgScore = scores.length
      ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : null;

    return {
      id: app._id,
      studentId: app.student?._id,
      name: app.student?.fullName || "Unknown",
      status: app.status,
      completionPct,
      avgScore,
      hasApplied: true
    };
  });

  
  // ---------------- NOT APPLIED ----------------
  const notAppliedStudents = allStudents
    .filter((s) => !appliedStudentSet.has(s._id.toString()))
    .map((s) => ({
      id: null,
      studentId: s._id,
      name: s.fullName,
      status: "not_applied",
      completionPct: 0,
      avgScore: null,
      hasApplied: false
    }));

  const allStudentStats = [...studentStats, ...notAppliedStudents];

 const validStudents = allStudentStats.filter((s) => s.hasApplied);

const scores = validStudents.map((s) =>
  s.avgScore != null ? s.avgScore : 0
);

const avgStudentScore = scores.length
  ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  : null;

 const atRisk = allStudentStats
  .map((s) => {
    let riskType = null;
    let reason = null;

    if (!s.hasApplied) {
      riskType = "NO_APPLICATION";
      reason = "Not applied to any internship";
    } else if (s.avgScore !== null && s.avgScore < 5) {
      riskType = "LOW_SCORE";
      reason = `Low performance (avg score: ${s.avgScore})`;
    } else if (s.completionPct < 30) {
      riskType = "LOW_PROGRESS";
      reason = `Low progress (${s.completionPct}% completed)`;
    } else if (
      s.status !== "ongoing" &&
      s.status !== "completed"
    ) {
      riskType = "INACTIVE";
      reason = "Inactive internship status";
    }

    if (!riskType) return null;

    return {
      id: s.studentId, // ✅ ONLY ONE ID — FIXED
      name: s.name,
      riskType,
      reason
    };
  })
  .filter(Boolean);
  
  // ---------------- CLEAN RECENT ACTIVITY ----------------
  const recentActivity = applications
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10)
    .map((a) => ({
      label: `${a.student?.fullName || "Student"}: ${a.status}`,
      time: a.updatedAt
    }));

  // ---------------- RETURN ----------------
  return {
    kpis: {
      totalStudents: allStudentStats.length,
      activeInternships,
      completedInternships,
      pendingApprovals,
      pendingTaskReviews
    },
    pipeline: statusGroups,
    taskStats: { totalTasks, ...taskStatusMap },
    studentStats: allStudentStats,
    atRisk,
    recentActivity
  };
};


export const getCompanyDashboard = async (userId) => {
  const onboarding = await CompanyOnboarding.findOne({
    createdUser: userId,
    status: "approved"
  }).lean();
  if (!onboarding?.company) throw new Error("Company not found");
  const companyId = onboarding.company;

  const [pipeline, internships, ongoingApps, recentActivity] = await Promise.all([
    // 1. Hiring pipeline counts
    Application.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),

    // 2. Internship stats
    Internship.aggregate([
      { $match: { company: companyId } },
      {
        $lookup: {
          from: "applications",
          let: { iid: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$internship", "$$iid"] } } },
            {
              $group: {
                _id: null,
                applicants: { $sum: 1 },
                selected: { $sum: { $cond: [{ $in: ["$status", ["selected", "offer_accepted", "ongoing", "completed"]] }, 1, 0] } },
                ongoing: { $sum: { $cond: [{ $eq: ["$status", "ongoing"] }, 1, 0] } }
              }
            }
          ],
          as: "stats"
        }
      },
      {
        $project: {
          title: 1, status: 1,
          applicants: { $ifNull: [{ $arrayElemAt: ["$stats.applicants", 0] }, 0] },
          selected: { $ifNull: [{ $arrayElemAt: ["$stats.selected", 0] }, 0] },
          ongoing: { $ifNull: [{ $arrayElemAt: ["$stats.ongoing", 0] }, 0] }
        }
      }
    ]),

    // 3. Ongoing intern stats with task progress
    Application.aggregate([
      { $match: { company: companyId, status: "ongoing" } },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student",
          foreignField: "_id",
          as: "studentDoc"
        }
      },
      {
        $lookup: {
          from: "internships",
          localField: "internship",
          foreignField: "_id",
          as: "internshipDoc"
        }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "application",
          as: "tasks"
        }
      },
      {
        $lookup: {
          from: "tasksubmissions",
          localField: "_id",
          foreignField: "application",
          as: "submissions"
        }
      },
      {
        $project: {
          name: { $arrayElemAt: ["$studentDoc.fullName", 0] },
          internshipTitle: { $arrayElemAt: ["$internshipDoc.title", 0] },
          evaluationScore: 1,
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: { input: "$tasks", as: "t", cond: { $eq: ["$$t.status", "completed"] } }
            }
          },
          avgScore: { $avg: "$submissions.score" }
        }
      },
      {
        $addFields: {
          progress: {
            $cond: [
              { $gt: ["$totalTasks", 0] },
              { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] },
              0
            ]
          }
        }
      }
    ]),

    // 4. Recent activity
    Application.find({ company: companyId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate("student", "fullName")
      .populate("internship", "title")
      .lean()
  ]);

  // Build pipeline map
  const pipelineMap = {};
  pipeline.forEach(({ _id, count }) => { pipelineMap[_id] = count; });

  const statuses = ["applied", "shortlisted", "selected", "offer_accepted", "ongoing", "completed"];
  const totalApplicants = statuses.reduce((s, k) => s + (pipelineMap[k] || 0), 0);

  const pipelineData = {};
  statuses.forEach((s, i) => {
    const count = pipelineMap[s] || 0;
    pipelineData[s] = {
      count,
      conversionRate: totalApplicants > 0 ? +((count / totalApplicants) * 100).toFixed(1) : 0
    };
  });

  // KPIs
  const totalInternships = internships.length;
  const activeInternships = internships.filter(i => i.status === "open").length;
  const selectedCandidates = (pipelineMap["selected"] || 0) + (pipelineMap["offer_accepted"] || 0);
  const ongoingInterns = pipelineMap["ongoing"] || 0;
  const completedInterns = pipelineMap["completed"] || 0;
  const scores = ongoingApps.filter(i => i.avgScore != null).map(i => i.avgScore);
  const avgInternScore = scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;

  // At-risk
  const atRisk = ongoingApps
    .filter(i => (i.avgScore != null && i.avgScore < 5) || i.progress < 20)
    .map(i => ({
      id: i._id,
      name: i.name,
      reason: i.avgScore != null && i.avgScore < 5 ? `Low score: ${i.avgScore?.toFixed(1)}/10` : "Low task progress"
    }));

  return {
    kpis: { totalInternships, activeInternships, totalApplicants, selectedCandidates, ongoingInterns, completedInterns, avgInternScore },
    pipeline: pipelineData,
    internshipStats: internships,
    internStats: ongoingApps.map(i => ({
      id: i._id,
      name: i.name,
      internship: i.internshipTitle,
      progress: +i.progress.toFixed(1),
      avgScore: i.avgScore != null ? +i.avgScore.toFixed(1) : null
    })),
    atRisk,
    recentActivity: recentActivity.map(a => ({
      id: a._id,
      student: a.student?.fullName || a.studentSnapshot?.fullName,
      internship: a.internship?.title,
      status: a.status,
      date: a.updatedAt
    })),
    actions: [
      { label: "View Applicants", route: "/company/company-internships" },
      { label: "View Interns", route: "/company/interns" }
    ]
  };
};


export const getMentorDashboard = async (userId) => {
  const mentor = await MentorProfile.findOne({ user: userId }).lean();
  if (!mentor) throw new Error("Mentor profile not found");
  const mentorId = mentor._id;

  const [taskStats, internStats, pendingReviews, recentActivity, kpiAgg] = await Promise.all([

    // 1. Task stats grouped by status
    Task.aggregate([
      { $match: { mentor: mentorId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),

    // 2. Intern stats — progress + avg score per application
    Application.aggregate([
      { $match: { mentor: mentorId, status: { $in: ["ongoing", "completed"] } } },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student",
          foreignField: "_id",
          as: "studentDoc"
        }
      },
      {
        $lookup: {
          from: "internships",
          localField: "internship",
          foreignField: "_id",
          as: "internshipDoc"
        }
      },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "application",
          as: "tasks"
        }
      },
      {
        $lookup: {
          from: "tasksubmissions",
          localField: "_id",
          foreignField: "application",
          as: "submissions"
        }
      },
      {
        $project: {
          status: 1,
          name: { $arrayElemAt: ["$studentDoc.fullName", 0] },
          internshipTitle: { $arrayElemAt: ["$internshipDoc.title", 0] },
          totalTasks: { $size: "$tasks" },
          completedTasks: {
            $size: {
              $filter: { input: "$tasks", as: "t", cond: { $eq: ["$$t.status", "completed"] } }
            }
          },
          avgScore: { $avg: "$submissions.score" },
          submissionCount: { $size: "$submissions" },
          revisionCount: {
            $size: {
              $filter: { input: "$submissions", as: "s", cond: { $eq: ["$$s.status", "revision_requested"] } }
            }
          }
        }
      },
      {
        $addFields: {
          progress: {
            $cond: [
              { $gt: ["$totalTasks", 0] },
              { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] },
              0
            ]
          }
        }
      }
    ]),

    // 3. Pending reviews — submitted / under_review submissions
    TaskSubmission.aggregate([
      { $match: { status: { $in: ["submitted", "under_review"] } } },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskDoc"
        }
      },
      { $match: { "taskDoc.mentor": mentorId } },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student",
          foreignField: "_id",
          as: "studentDoc"
        }
      },
      {
        $project: {
          taskId: "$task",
          applicationId: "$application",
          studentName: { $arrayElemAt: ["$studentDoc.fullName", 0] },
          submittedAt: 1,
          status: 1,
          attempt: 1
        }
      },
      { $sort: { submittedAt: 1 } }
    ]),

    // 4. Recent activity — last 10 submissions for this mentor's tasks
    TaskSubmission.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskDoc"
        }
      },
      { $match: { "taskDoc.mentor": mentorId } },
      {
        $lookup: {
          from: "studentprofiles",
          localField: "student",
          foreignField: "_id",
          as: "studentDoc"
        }
      },
      {
        $project: {
          studentName: { $arrayElemAt: ["$studentDoc.fullName", 0] },
          taskTitle: { $arrayElemAt: ["$taskDoc.title", 0] },
          status: 1,
          submittedAt: 1,
          applicationId: "$application"
        }
      },
      { $sort: { submittedAt: -1 } },
      { $limit: 10 }
    ]),

    // 5. KPI aggregation — application counts
    Application.aggregate([
      { $match: { mentor: mentorId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ])
  ]);

  // Build task stats map
  const taskMap = {};
  taskStats.forEach(({ _id, count }) => { taskMap[_id] = count; });
  const totalTasks = Object.values(taskMap).reduce((a, b) => a + b, 0);

  // Build KPI map
  const kpiMap = {};
  kpiAgg.forEach(({ _id, count }) => { kpiMap[_id] = count; });

  const scores = internStats.filter(i => i.avgScore != null).map(i => i.avgScore);
  const avgInternScore = scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;

  // At-risk
  const atRisk = internStats
    .filter(i => i.submissionCount === 0 || i.revisionCount >= 3 || (i.avgScore != null && i.avgScore < 5))
    .map(i => ({
      id: i._id,
      name: i.name,
      reason: i.submissionCount === 0
        ? "No submissions yet"
        : i.revisionCount >= 3
        ? `${i.revisionCount} revisions requested`
        : `Low score: ${i.avgScore?.toFixed(1)}/10`
    }));

  return {
    kpis: {
      totalInterns: (kpiMap["ongoing"] || 0) + (kpiMap["completed"] || 0),
      activeInternships: kpiMap["ongoing"] || 0,
      completedInternships: kpiMap["completed"] || 0,
      pendingTaskReviews: pendingReviews.length,
      avgInternScore
    },
    taskStats: {
      totalTasks,
      submitted: taskMap["submitted"] || 0,
      under_review: taskMap["under_review"] || 0,
      revision_requested: taskMap["revision_requested"] || 0,
      completed: taskMap["completed"] || 0,
      pending: taskMap["assigned"] || 0
    },
    internStats: internStats.map(i => ({
      id: i._id,
      name: i.name,
      internship: i.internshipTitle,
      progress: +i.progress.toFixed(1),
      avgScore: i.avgScore != null ? +i.avgScore.toFixed(1) : null
    })),
    pendingReviews,
    atRisk,
    recentActivity,
    actions: [
      { label: "Review Submissions", route: "/mentor/interns" },
      { label: "View Interns", route: "/mentor/interns" }
    ]
  };
};



const now = new Date();
const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
 
export const getAdminDashboard = async (userId) => {
  const [
    userStats,
    collegeStats,
    companyStats,
    applicationStats,
    onboardingStats,
    growthStats,
    internshipStats,
    atRiskData,
    recentActivity,
  ] = await Promise.all([
    // ── USER STATS ──────────────────────────────────────────
    User.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
          active: [
            { $match: { lastLoginAt: { $gte: thirtyDaysAgo } } },
            { $count: "count" },
          ],
          unverified: [
            { $match: { isVerified: false, accountStatus: "active" } },
            { $count: "count" },
          ],
        },
      },
    ]),
 
    // ── COLLEGE STATS ────────────────────────────────────────
    College.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [{ $match: { status: "active" } }, { $count: "count" }],
          inactive: [{ $match: { status: "inactive" } }, { $count: "count" }],
          newThirtyDays: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $count: "count" },
          ],
          inactiveList: [
            { $match: { status: "inactive" } },
            { $project: { _id: 1, name: 1, createdAt: 1 } },
            { $limit: 10 },
          ],
        },
      },
    ]),
 
    // ── COMPANY STATS ────────────────────────────────────────
    Company.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [{ $match: { status: "active" } }, { $count: "count" }],
          inactive: [{ $match: { status: "inactive" } }, { $count: "count" }],
          newThirtyDays: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $count: "count" },
          ],
          inactiveList: [
            { $match: { status: "inactive" } },
            { $project: { _id: 1, name: 1, createdAt: 1 } },
            { $limit: 10 },
          ],
        },
      },
    ]),
 
    // ── APPLICATION STATS ────────────────────────────────────
    Application.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          newThirtyDays: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $count: "count" },
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "studentprofiles",
                localField: "student",
                foreignField: "_id",
                as: "studentData",
              },
            },
            {
              $project: {
                _id: 1,
                status: 1,
                createdAt: 1,
                "studentData.fullName": 1,
              },
            },
          ],
        },
      },
    ]),
 
    // ── ONBOARDING STATS ─────────────────────────────────────
    Promise.all([
      CollegeOnboarding.aggregate([
        {
          $facet: {
            pending: [{ $match: { status: "pending" } }, { $count: "count" }],
            stalledList: [
              {
                $match: {
                  status: "pending",
                  createdAt: { $lte: sevenDaysAgo },
                },
              },
              {
                $project: {
                  _id: 1,
                  collegeName: 1,
                  requesterEmail: 1,
                  createdAt: 1,
                },
              },
              { $limit: 10 },
            ],
            recentApproved: [
              { $match: { status: "approved" } },
              { $sort: { reviewedAt: -1 } },
              { $limit: 3 },
              {
                $project: {
                  _id: 1,
                  collegeName: 1,
                  reviewedAt: 1,
                  status: 1,
                },
              },
            ],
          },
        },
      ]),
      CompanyOnboarding.aggregate([
        {
          $facet: {
            pending: [{ $match: { status: "pending" } }, { $count: "count" }],
            stalledList: [
              {
                $match: {
                  status: "pending",
                  createdAt: { $lte: sevenDaysAgo },
                },
              },
              {
                $project: {
                  _id: 1,
                  companyName: 1,
                  requesterEmail: 1,
                  createdAt: 1,
                },
              },
              { $limit: 10 },
            ],
            recentApproved: [
              { $match: { status: "approved" } },
              { $sort: { reviewedAt: -1 } },
              { $limit: 3 },
              {
                $project: {
                  _id: 1,
                  companyName: 1,
                  reviewedAt: 1,
                  status: 1,
                },
              },
            ],
          },
        },
      ]),
    ]),
 
    // ── GROWTH (new users 30d) ───────────────────────────────
    User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
 
    // ── INTERNSHIP STATS ─────────────────────────────────────
    Internship.aggregate([
      {
        $facet: {
          open: [{ $match: { status: "open" } }, { $count: "count" }],
          closed: [{ $match: { status: "closed" } }, { $count: "count" }],
        },
      },
    ]),
 
    // ── AT RISK DATA ─────────────────────────────────────────
    Promise.all([
      College.find({ status: "inactive" }, { _id: 1, name: 1 }).lean().limit(5),
      Company.find({ status: "inactive" }, { _id: 1, name: 1 }).lean().limit(5),
      User.find(
        { isVerified: false, accountStatus: "active" },
        { _id: 1, email: 1, role: 1, createdAt: 1 }
      )
        .lean()
        .limit(10),
    ]),
 
    // ── RECENT ACTIVITY ──────────────────────────────────────
    Promise.all([
      CollegeOnboarding.find({ status: "approved" })
        .sort({ reviewedAt: -1 })
        .limit(4)
        .lean()
        .then((r) =>
          r.map((x) => ({
            type: "college_approved",
            label: `College approved: ${x.collegeName}`,
            time: x.reviewedAt,
          }))
        ),
      CompanyOnboarding.find({ status: "approved" })
        .sort({ reviewedAt: -1 })
        .limit(3)
        .lean()
        .then((r) =>
          r.map((x) => ({
            type: "company_approved",
            label: `Company approved: ${x.companyName}`,
            time: x.reviewedAt,
          }))
        ),
      User.find({}, { email: 1, role: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean()
        .then((r) =>
          r.map((x) => ({
            type: "new_user",
            label: `New ${x.role}: ${x.email}`,
            time: x.createdAt,
          }))
        ),
    ]),
  ]);
 
  // ── PARSE USER STATS ──────────────────────────────────────
  const uStats = userStats[0];
  const totalUsers = uStats.total[0]?.count ?? 0;
  const activeUsers = uStats.active[0]?.count ?? 0;
  const unverifiedCount = uStats.unverified[0]?.count ?? 0;
  const roleMap = Object.fromEntries(
    (uStats.byRole || []).map((r) => [r._id, r.count])
  );
 
  // ── PARSE COLLEGE / COMPANY ───────────────────────────────
  const cStats = collegeStats[0];
  const coStats = companyStats[0];
 
  // ── PARSE APPLICATIONS ────────────────────────────────────
  const aStats = applicationStats[0];
  const totalApplications = aStats.total[0]?.count ?? 0;
  const statusMap = Object.fromEntries(
    (aStats.byStatus || []).map((s) => [s._id, s.count])
  );
  const completedApps = statusMap["completed"] ?? 0;
  const ongoingApps = statusMap["ongoing"] ?? 0;
  const successRate =
    totalApplications > 0
      ? Math.round((completedApps / totalApplications) * 100)
      : 0;
 
  // ── PARSE ONBOARDING ──────────────────────────────────────
  const [collegeOnboarding, companyOnboarding] = onboardingStats;
  const coOnb = collegeOnboarding[0];
  const cpOnb = companyOnboarding[0];
 
  const stalledOnboarding = [
    ...(coOnb.stalledList || []).map((x) => ({
      id: x._id,
      type: "college_onboarding",
      reason: `College request stalled: ${x.collegeName}`,
      createdAt: x.createdAt,
    })),
    ...(cpOnb.stalledList || []).map((x) => ({
      id: x._id,
      type: "company_onboarding",
      reason: `Company request stalled: ${x.companyName}`,
      createdAt: x.createdAt,
    })),
  ];
 
  // ── PARSE GROWTH ──────────────────────────────────────────
  const growthRoleMap = Object.fromEntries(
    (growthStats || []).map((g) => [g._id, g.count])
  );
 
  // ── PARSE AT-RISK ─────────────────────────────────────────
  const [inactiveColleges, inactiveCompanies, unverifiedUsers] = atRiskData;
 
  const atRisk = [
    ...inactiveColleges.map((c) => ({
      id: c._id,
      type: "inactive_college",
      reason: `Inactive college: ${c.name}`,
    })),
    ...inactiveCompanies.map((c) => ({
      id: c._id,
      type: "inactive_company",
      reason: `Inactive company: ${c.name}`,
    })),
    ...unverifiedUsers.slice(0, 5).map((u) => ({
      id: u._id,
      type: "unverified_user",
      reason: `Unverified ${u.role}: ${u.email}`,
    })),
    ...stalledOnboarding.slice(0, 5),
  ];
 
  // ── RECENT ACTIVITY ───────────────────────────────────────
  const [collegeApprovals, companyApprovals, newUsers] = recentActivity;
  const allActivity = [...collegeApprovals, ...companyApprovals, ...newUsers]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 10);
 
  // ── INTERNSHIP STATS ──────────────────────────────────────
  const iStats = internshipStats[0];
 
  return {
    kpis: {
      totalUsers,
      totalStudents: roleMap["student"] ?? 0,
      totalFaculty: roleMap["faculty"] ?? 0,
      totalCompanies: coStats.total[0]?.count ?? 0,
      totalColleges: cStats.total[0]?.count ?? 0,
      activeUsers,
      totalApplications,
    },
 
    onboarding: {
      pendingCollegeRequests: coOnb.pending[0]?.count ?? 0,
      pendingCompanyRequests: cpOnb.pending[0]?.count ?? 0,
      recentApproved: [
        ...(coOnb.recentApproved || []).map((x) => ({
          ...x,
          entityType: "college",
        })),
        ...(cpOnb.recentApproved || []).map((x) => ({
          ...x,
          entityType: "company",
        })),
      ].sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt)),
    },
 
    growth: {
      newUsers: Object.values(growthRoleMap).reduce((a, b) => a + b, 0),
      newColleges: cStats.newThirtyDays[0]?.count ?? 0,
      newCompanies: coStats.newThirtyDays[0]?.count ?? 0,
      newApplications: aStats.newThirtyDays[0]?.count ?? 0,
      byRole: growthRoleMap,
    },
 
    systemStats: {
      activeInternships: iStats.open[0]?.count ?? 0,
      closedInternships: iStats.closed[0]?.count ?? 0,
      ongoingApplications: ongoingApps,
      completedInternships: completedApps,
      successRate,
    },
 
    atRisk,
 
    recentActivity: allActivity,
 
    actions: [
      { label: "Review Onboarding", route: "/admin/onboarding/pending" },
      { label: "Manage Users", route: "/admin/users" },
      { label: "View Colleges", route: "/admin/colleges" },
      { label: "View Companies", route: "/admin/companies" },
    ],
  };
};
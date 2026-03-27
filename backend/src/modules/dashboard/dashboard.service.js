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
    const start = new Date(ongoingApplication.internshipStartDate);
    const end = ongoingApplication.internshipEndDate
      ? new Date(ongoingApplication.internshipEndDate)
      : (() => {
          const d = new Date(start);
          d.setMonth(
            d.getMonth() + (ongoingApplication.internship?.durationMonths || 3)
          );
          return d;
        })();

    const totalDays = Math.max((end - start) / (1000 * 60 * 60 * 24), 1);
    const elapsed = Math.min(
      Math.max((today - start) / (1000 * 60 * 60 * 24), 0),
      totalDays
    );
    const progress = Math.round((elapsed / totalDays) * 100);

        /// Task progress calculation
//     const completedTasks = taskMap.completed || 0;
// const totalTasks = Object.values(taskMap).reduce((a, b) => a + b, 0) || 1;

// const progress = Math.round((completedTasks / totalTasks) * 100);

    currentInternship = {
      applicationId: ongoingApplication._id,
      title: ongoingApplication.internship?.title || "N/A",
      company: ongoingApplication.company?.name || "N/A",
      startDate: ongoingApplication.internshipStartDate,
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

async function getCollegeDashboard(collegeId) {
  const cId = new mongoose.Types.ObjectId(collegeId);
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

  // Parallel execution for maximum performance
  const [kpis, specializationStats, facultyStats, atRiskData, recentActivity, creditStats] = await Promise.all([
    // 1. KPI CARDS & PLACEMENT PIPELINE
    Application.aggregate([
      { $lookup: { from: "studentprofiles", localField: "student", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { $match: { "student.college": cId } },
      {
        $facet: {
          pipeline: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          totals: [
            {
              $group: {
                _id: null,
                studentsWithInternships: { $addToSet: "$student._id" },
                completedInternships: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
              }
            },
            { $project: { countWithInternships: { $size: "$studentsWithInternships" }, completedInternships: 1 } }
          ]
        }
      }
    ]),

    // 2. SPECIALIZATION PERFORMANCE
    StudentProfile.aggregate([
      { $match: { college: cId } },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "student",
          as: "apps"
        }
      },
      {
        $project: {
          specialization: 1,
          isPlaced: { $cond: [{ $gt: [{ $size: { $filter: { input: "$apps", as: "a", cond: { $in: ["$$a.status", ["selected", "ongoing", "completed"]] } } } }, 0] }, 1, 0] },
          score: { $arrayElemAt: ["$apps.evaluationScore", 0] }
        }
      },
      {
        $group: {
          _id: "$specialization",
          totalStudents: { $sum: 1 },
          placedStudents: { $sum: "$isPlaced" },
          avgScore: { $avg: "$score" }
        }
      },
      {
        $project: {
          specialization: "$_id",
          totalStudents: 1,
          placedStudents: 1,
          avgScore: { $ifNull: ["$avgScore", 0] },
          placementRate: { $multiply: [{ $divide: ["$placedStudents", "$totalStudents"] }, 100] }
        }
      },
      { $sort: { placementRate: -1 } }
    ]),

    // 3. FACULTY ENGAGEMENT
    FacultyProfile.aggregate([
      { $match: { college: cId } },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "faculty",
          as: "mappedApps"
        }
      },
      {
        $project: {
          fullName: 1,
          studentCount: { $size: "$mappedApps" },
          activeInternships: { $size: { $filter: { input: "$mappedApps", as: "a", cond: { $eq: ["$$a.status", "ongoing"] } } } },
          status: 1
        }
      },
      { $sort: { studentCount: -1 } }
    ]),

    // 4. AT-RISK STUDENTS
    StudentProfile.aggregate([
      { $match: { college: cId, status: "active" } },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "student",
          as: "apps"
        }
      },
      {
        $project: {
          fullName: 1,
          apps: 1,
          noInternship: { $eq: [{ $size: "$apps" }, 0] },
          stuckInApplied: {
            $gt: [
              { $size: { $filter: { input: "$apps", as: "a", cond: { $and: [{ $eq: ["$$a.status", "applied"] }, { $lt: ["$$a.appliedAt", fifteenDaysAgo] }] } } } },
              0
            ]
          },
          lowScore: { $gt: [{ $size: { $filter: { input: "$apps", as: "a", cond: { $lt: ["$$a.evaluationScore", 5] } } } }, 0] }
        }
      },
      { $match: { $or: [{ noInternship: true }, { stuckInApplied: true }, { lowScore: true }] } },
      { $limit: 10 }
    ]),

    // 5. RECENT ACTIVITY
    Application.find()
      .populate("student", "fullName")
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean(),

    // 6. CREDIT SYSTEM
    InternshipReport.aggregate([
      { $lookup: { from: "applications", localField: "application", foreignField: "_id", as: "app" } },
      { $unwind: "$app" },
      { $lookup: { from: "studentprofiles", localField: "student", foreignField: "_id", as: "student" } },
      { $unwind: "$student" },
      { $match: { "student.college": cId } },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: "$creditsEarned" },
          completed: { $sum: { $cond: [{ $eq: ["$status", "faculty_approved"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "faculty_pending"] }, 1, 0] } }
        }
      }
    ])
  ]);

  const totalStudents = await StudentProfile.countDocuments({ college: cId });
  const activeFaculty = facultyStats.filter(f => f.status === "active").length;

  return {
    kpis: {
      totalStudents,
      activeStudents: await StudentProfile.countDocuments({ college: cId, status: "active" }),
      studentsWithInternships: kpis[0]?.totals[0]?.countWithInternships || 0,
      completedInternships: kpis[0]?.totals[0]?.completedInternships || 0,
      placementRate: totalStudents > 0 ? ((kpis[0]?.totals[0]?.countWithInternships || 0) / totalStudents * 100).toFixed(1) : 0,
      totalFaculty: facultyStats.length,
      activeFaculty,
      avgStudentScore: specializationStats.length > 0 ? (specializationStats.reduce((acc, curr) => acc + curr.avgScore, 0) / specializationStats.length).toFixed(1) : 0
    },
    pipeline: kpis[0]?.pipeline || [],
    specializations: specializationStats,
    facultyEngagement: {
      topFaculty: facultyStats.slice(0, 5),
      inactiveFaculty: facultyStats.filter(f => f.studentCount === 0)
    },
    atRisk: atRiskData.map(s => ({
      studentId: s._id,
      name: s.fullName,
      reason: s.noInternship ? "No Internship" : s.stuckInApplied ? "Stuck in Applied > 15d" : "Low Evaluation Score"
    })),
    credits: creditStats[0] || { totalCredits: 0, completed: 0, pending: 0 },
    recentActivity: recentActivity.map(a => ({
      type: a.status,
      student: a.studentSnapshot.fullName,
      date: a.updatedAt,
      id: a._id
    })),
    actionQueue: [
      { label: "Review Pending Reports", route: "/college/credits", count: creditStats[0]?.pending || 0 },
      { label: "View At-Risk Students", route: "/college/students", count: atRiskData.length },
      { label: "Manage Faculty Workload", route: "/college/faculty", count: facultyStats.filter(f => f.studentCount > 10).length }
    ]
  };
}
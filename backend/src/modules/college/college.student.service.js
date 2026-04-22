import StudentProfile from "../../models/StudentProfile.js";
import StudentAcademicHistory from "../../models/StudentAcademicHistory.js";
import User from "../../models/User.js";
import mongoose from "mongoose";
import InternshipReport from "../../models/InternshipReport.js";
import College from "../../models/College.js";
import Application from "../../models/Application.js";
import sendEmail from "../../utils/sendEmail.js";
import Notification from "../../models/Notification.js";
import FacultyProfile from "../../models/FacultyProfile.js";

export const getCollegeStudentsService = async (user) => {

  const collegeId = user.referenceId;

  const students = await StudentProfile.find({
    college: collegeId,
    status: "active"
  })
    .select(`
      fullName
      prn
      abcId
      phoneNo
      courseName
      specialization
      courseStartYear
      courseEndYear
      Year
      status
    `)
    .populate("user", "email")
    .lean();

  return students;
};



export const updateCollegeStudentService = async (
  user,
  studentId,
  body
) => {

  const collegeId = user.referenceId;

  const student = await StudentProfile.findOne({
    _id: studentId,
    college: collegeId
  });

  if (!student) throw new Error("Student not found");

  const fields = [
    "courseName",
    "specialization",
    "courseStartYear",
    "courseEndYear",
    "Year",
    "status"
  ];

  fields.forEach((f) => {
    if (body[f] !== undefined) {
      student[f] = body[f];
    }
  });

  if (body.prn !== undefined) {
    student.prn = body.prn;
  }

  if (body.abcId !== undefined) {

    if (!/^\d{12}$/.test(body.abcId)) {
      throw new Error("ABC ID must be 12 digits");
    }

    student.abcId = body.abcId;
  }

  await student.save();

  return student;
};



export const removeStudentFromCollegeService = async (
  user,
  studentId
) => {

  const collegeId = user.referenceId;

  const student = await StudentProfile.findOne({
    _id: studentId,
    college: collegeId
  });

  if (!student) throw new Error("Student not found");

  await StudentAcademicHistory.updateOne(
    {
      student: studentId,
      status: "active"
    },
    {
      endDate: new Date(),
      status: "ended",
      endedBy: user._id
    }
  );

  student.college = null;
  student.status = "unassigned";

  await student.save();

  const userDoc = await User.findById(student.user);

  if (userDoc) {
    userDoc.password = null;
    userDoc.isRegistered = false;
    userDoc.isVerified = false;
    await userDoc.save();
  }

  return { success: true };
};


export const searchStudentService = async (query, user, options = {}) => {
  if (!query || !query.trim()) {
    throw new Error("Search query required");
  }

  const trimmedQuery = query.trim();

  // pagination defaults
  const limit = Math.min(Number(options.limit) || 10, 50); // max 50
  const page = Number(options.page) || 1;
  const skip = (page - 1) * limit;

  let filter = {};

  // 🔍 ABC ID exact match (fast path)
  if (/^\d{12}$/.test(trimmedQuery)) {
    filter.abcId = trimmedQuery;
  } else {
    // 🔍 Name search (case-insensitive, partial)
    filter.fullName = {
      $regex: trimmedQuery,
      $options: "i",
    };
  }

  // 🔒 COLLEGE RESTRICTION
  if (user.role === "college") {
    filter.college = user.referenceId;
  }

  // 🔍 QUERY EXECUTION
  const students = await StudentProfile.find(filter)
    .select("fullName abcId college")
    .sort({ fullName: 1 }) // alphabetical
    .skip(skip)
    .limit(limit)
    .lean();

  // count for pagination
  const total = await StudentProfile.countDocuments(filter);

  if (!students.length) {
    throw new Error("No students found");
  }

  return {
    results: students,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStudentReportsService = async (studentId, user) => {

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student id");
  }

  const student = await StudentProfile.findById(studentId);

  if (!student) {
    throw new Error("Student not found");
  }

  // 🔒 COLLEGE VALIDATION
  if (
    user.role === "college" &&
   student.college?.toString() !== String(user.referenceId)
  ) {
    throw new Error("Unauthorized access to this student");
  }

  const reports = await InternshipReport.find({
    student: studentId
  })
    .populate({
      path: "application",
      populate: {
        path: "internship",
        select: "title"
      }
    })
    .select(`
      facultyScore
      creditsEarned
      completionRate
      status
    `);

  return reports;
};

/*
  ================= CREDIT CALCULATION =================
*/

export const assignCreditsService = async ({
  reportId,
  facultyScore,
  remarks,
  user
}) => {

  // ================= VALIDATION =================
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    throw new Error("Invalid report id");
  }

  if (facultyScore < 0 || facultyScore > 10) {
    throw new Error("Score must be between 0 and 10");
  }

  const report = await InternshipReport.findById(reportId)
    .populate({
      path: "application",
      populate: {
        path: "student"
      }
    });

  if (!report) {
    throw new Error("Report not found");
  }

  if (!["faculty", "college"].includes(user.role)) {
    throw new Error("Unauthorized");
  }

  const student = report.application?.student;

  if (!student) {
    throw new Error("Invalid report data (student missing)");
  }

  // ================= COLLEGE VALIDATION =================
  if (
    user.role === "college" &&
    (!student.college ||
      !student.college.equals(user.referenceId))
  ) {
    throw new Error("You can only assign credits to your college students");
  }

  // ================= FACULTY VALIDATION =================
  if (
    user.role === "faculty" &&
    report.mentor &&
    !report.mentor.equals(user.referenceId)
  ) {
    throw new Error("You are not assigned to this internship");
  }

  // ================= PREVENT DUPLICATE =================
  if (report.facultyStatus === "approved") {
    throw new Error("Credits already assigned");
  }

  // ================= 🔥 CORRECT CREDIT LOGIC =================

  // 1. Fetch student full profile
  const studentProfile = await StudentProfile.findById(student._id);

  if (!studentProfile) {
    throw new Error("Student profile not found");
  }

  // 2. Fetch college to get course credits
  const college = await College.findById(studentProfile.college);

  if (!college) {
    throw new Error("College not found");
  }

  // 3. Find course inside college
  const course = college.courses.find(
    c => c._id.toString() === studentProfile.courseId?.toString()
  );

  if (!course) {
    throw new Error("Course not found for student");
  }

  // 🔥 FINAL CREDIT VALUE
  let credits = course.credits || 0;

  // Optional: completion rule
  if ((report.completionRate || 0) < 50) {
    credits = 0;
  }

  // ================= SAVE =================
  report.facultyScore = facultyScore;
  report.facultyRemarks = remarks;
  report.creditsEarned = credits;

  report.facultyStatus = "approved";
  report.status = "faculty_approved";
  report.approvedAt = new Date();

  await report.save();

  return {
    creditsEarned: credits
  };
};



// ---------------- GET ALL AT-RISK STUDENTS ----------------
export const getAtRiskStudentsService = async ({
  collegeId,
  search = "",
  page = 1,
  limit = 20
}) => {
  if (!mongoose.Types.ObjectId.isValid(collegeId)) {
    throw new Error("Invalid collegeId");
  }

  const skip = (page - 1) * limit;

  const thirteenDaysAgo = new Date();
  thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

  const matchStage = {
    college: new mongoose.Types.ObjectId(collegeId),
    status: "active"
  };

  if (search) {
    matchStage.fullName = { $regex: search, $options: "i" };
  }

  const pipeline = [
    { $match: matchStage },

    {
      $lookup: {
        from: "applications",
        localField: "_id",
        foreignField: "student",
        as: "apps"
      }
    },

    {
      $addFields: {
        noInternship: { $eq: [{ $size: "$apps" }, 0] },
        oldestApp: { $min: "$apps.appliedAt" },
        latestScore: { $max: "$apps.evaluationScore" }
      }
    },

    {
      $addFields: {
        riskType: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$noInternship", true] },
                then: "NO_APPLICATION"
              },
              {
                case: {
                  $lt: ["$oldestApp", thirteenDaysAgo]
                },
                then: "INACTIVE"
              },
              {
                case: {
                  $lt: ["$latestScore", 5]
                },
                then: "LOW_SCORE"
              }
            ],
            default: null
          }
        }
      }
    },

    {
      $match: {
        riskType: { $ne: null }
      }
    },

    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      }
    },

    { $unwind: "$userData" },

    {
      $addFields: {
        reason: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$riskType", "NO_APPLICATION"] },
                then: "No internship applications"
              },
              {
                case: { $eq: ["$riskType", "INACTIVE"] },
                then: "No recent activity (13+ days)"
              },
              {
                case: { $eq: ["$riskType", "LOW_SCORE"] },
                then: "Low evaluation score"
              }
            ],
            default: "At risk"
          }
        }
      }
    },

    {
      $project: {
        _id: 0,
        id: "$_id",
        name: "$fullName",
        email: "$userData.email",
        specialization: 1,
        courseName: 1,
        year: "$Year",
        riskType: 1,
        reason: 1
      }
    },

    { $sort: { name: 1 } },

    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }]
      }
    }
  ];

  const result = await StudentProfile.aggregate(pipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.total[0]?.count || 0;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// ---------------- GET SINGLE AT-RISK STUDENT ----------------
export const getAtRiskStudentByIdService = async (studentId) => {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid studentId");
  }

  const thirteenDaysAgo = new Date();
  thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

  const student = await StudentProfile.findById(studentId)
    .populate("user", "email")
    .lean();

  if (!student) return null;

  const apps = await Application.find({ student: student._id }).lean();

const noInternship = apps.length === 0;

const latestScore = apps.length
  ? Math.max(...apps.map(a => a.evaluationScore || 0))
  : null;

const completionPct = apps.length
  ? Math.max(...apps.map(a => a.completionPct || 0))
  : 0;

const inactive =
  apps.length &&
  !apps.some(a => a.status === "ongoing" || a.status === "completed");

let riskType = null;
let reason = null;

// ✅ ORDER MATTERS (don’t mess this up)
if (noInternship) {
  riskType = "NO_APPLICATION";
  reason = "Not applied to any internship";
}
else if (latestScore !== null && latestScore < 5) {
  riskType = "LOW_SCORE";
  reason = `Low score (${latestScore})`;
}
else if (completionPct < 30) {   // 🔥 THIS WAS MISSING
  riskType = "LOW_PROGRESS";
  reason = `Low progress (${completionPct}%)`;
}
else if (inactive) {
  riskType = "INACTIVE";
  reason = "Inactive internship";
}

if (!riskType) return null;

return {
  id: student._id,
  name: student.fullName,
  email: student.user?.email,
  riskType,
  reason,
  latestScore,
  completionPct
};
};


export const notifyAtRiskStudentService = async ({
  studentId,
  message,
  user
}) => {
  // ---------------- VALIDATION ----------------
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid studentId");
  }

  if (!user?._id) {
    throw new Error("Sender user missing");
  }

  // ---------------- FETCH STUDENT + APPLICATION DATA ----------------
  const student = await StudentProfile.findById(studentId)
    .populate("user", "email")
    .lean();

  if (!student) throw new Error("Student not found");
  if (!student.user?.email) throw new Error("Student email not found");

  const apps = await Application.find({ student: student._id }).lean();

  // ---------------- CALCULATE RISK ----------------
  const noInternship = apps.length === 0;

  const oldestApp = apps.length
    ? new Date(Math.min(...apps.map(a => new Date(a.appliedAt))))
    : null;

  const latestScore = apps.length
    ? Math.max(...apps.map(a => a.evaluationScore || 0))
    : null;

  const completionPct = apps.length
    ? Math.max(...apps.map(a => a.completionPct || 0))
    : 0;

  const inactive =
    apps.length &&
    !apps.some(a => a.status === "ongoing" || a.status === "completed");

  let riskType = null;
  let reason = null;

  if (noInternship) {
    riskType = "NO_APPLICATION";
    reason = "Not applied to any internship";
  } else if (latestScore !== null && latestScore < 5) {
    riskType = "LOW_SCORE";
    reason = `Low score (${latestScore})`;
  } else if (completionPct < 30) {
    riskType = "LOW_PROGRESS";
    reason = `Low progress (${completionPct}%)`;
  } else if (inactive) {
    riskType = "INACTIVE";
    reason = "Inactive internship";
  }

  if (!riskType) {
    throw new Error("Student is not at risk");
  }

  // ---------------- MESSAGE GENERATOR ----------------
  const getMessageByRisk = (riskType, data, customMessage) => {
    if (customMessage?.trim().length >= 5) return customMessage;

    switch (riskType) {
      case "NO_APPLICATION":
        return `You have not applied to any internships yet. Start applying immediately to stay on track.`;

      case "INACTIVE": {
        const daysInactive = data.oldestApp
          ? Math.floor(
              (Date.now() - new Date(data.oldestApp)) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        return daysInactive
          ? `You have been inactive for ${daysInactive} days. Resume applying immediately.`
          : "You are currently inactive. Please resume your internship activity.";
      }

      case "LOW_SCORE":
        return `Your recent evaluation score is ${data.latestScore}. Focus on improving your performance.`;

      case "LOW_PROGRESS":
        return `Your internship progress is only ${data.completionPct}%. Increase your activity and complete tasks regularly.`;

      default:
        return "You are at risk. Immediate action is required.";
    }
  };

  const finalMessage = getMessageByRisk(
    riskType,
    { oldestApp, latestScore, completionPct },
    message
  );

  // ---------------- EMAIL ----------------
  const emailHtml = `
    <div style="font-family: Arial, sans-serif;">
      <p>Hi ${student.fullName},</p>

      <p><strong>⚠️ Internship Alert</strong></p>

      <p>${finalMessage}</p>

      <p>
        👉 <a href="https://your-app-link.com">Apply / Track Internships</a>
      </p>

      <p>Contact your faculty if you need help.</p>

      <br/>
      <p>— InternStatus Team</p>
    </div>
  `;

  await sendEmail({
    to: student.user.email,
    subject: "⚠️ Internship Status Alert",
    html: emailHtml
  });

  // ---------------- STORE NOTIFICATION ----------------
  await Notification.create({
    recipient: student.user._id,
    recipientModel: "StudentProfile",

    sender: user._id,
    senderRole: user.role,

    title: "Internship Alert",
    message: finalMessage,

    type: "AT_RISK",
    referenceId: student._id,
    referenceModel: "StudentProfile",

    meta: {
      riskType,
      reason,
      latestScore,
      completionPct
    },

    channels: ["email", "in_app"],
    status: "sent",
    sentAt: new Date()
  });

  return {
    success: true,
    riskType,
    message: finalMessage
  };
};
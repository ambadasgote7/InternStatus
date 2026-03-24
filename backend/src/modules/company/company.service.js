import Company from "../../models/Company.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";
import MentorProfile from "../../models/MentorProfile.js";
import MentorEmploymentHistory from "../../models/MentorEmploymentHistory.js";
import User from "../../models/User.js";
import mongoose from "mongoose";
import Application from "../../models/Application.js";
import Task from "../../models/Task.js";
import ProgressLog from "../../models/ProgressLog.js";
import InternshipReport from "../../models/InternshipReport.js";
import Internship from "../../models/Internship.js";

const EDITABLE_FIELDS = [
  "name",
  "website",
  "industry",
  "companySize",
  "description",
];

// =============================
// GET COMPANY PROFILE
// =============================
export const getCompanyProfileService = async (user) => {
  const companyId = user.referenceId;

  if (!companyId) {
    throw new Error("No company associated with user");
  }

  const profile = await Company.findById(companyId).lean();

  if (!profile) {
    throw new Error("Company not found");
  }

  return profile;
};

// =============================
// UPDATE COMPANY PROFILE
// =============================
export const updateCompanyProfileService = async (user, body, file) => {
  const companyId = user.referenceId;

  if (!companyId) {
    throw new Error("No company associated with user");
  }

  const profile = await Company.findById(companyId);

  if (!profile) {
    throw new Error("Company not found");
  }

  // ===== WHITELIST UPDATE =====
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      const value =
        typeof body[field] === "string" ? body[field].trim() : body[field];

      profile[field] = value;
    }
  });

  // ===== LOCATIONS =====
  if (body.locations !== undefined) {
    try {
      const parsed =
        typeof body.locations === "string"
          ? JSON.parse(body.locations)
          : body.locations;

      if (Array.isArray(parsed)) {
        profile.locations = parsed;
      }
    } catch (err) {
      throw new Error("Invalid locations format");
    }
  }

  // ===== LOGO UPLOAD =====
  if (file) {
    const upload = await uploadToCloudinary(file, "company-logos");

    profile.logoUrl = upload.secure_url;
  }

  // ===== PROFILE COMPLETION =====
  const requiredFields = [
    profile.name,
    profile.industry,
    profile.companySize,
    profile.locations?.length,
  ];

  const isComplete = requiredFields.every(Boolean);

  profile.profileStatus = isComplete ? "completed" : "pending";

  if (isComplete && !profile.profileCompletedAt) {
    profile.profileCompletedAt = new Date();
  }

  await profile.save();

  return profile;
};

export const getCompanyMentorsService = async (user) => {
  const companyId = user.referenceId;

  const mentors = await MentorProfile.find({
    company: companyId,
    status: "active",
  })
    .populate("user", "email")
    .lean();

  return mentors;
};

export const updateCompanyMentorService = async (user, mentorId, body) => {
  const companyId = user.referenceId;

  const mentor = await MentorProfile.findOne({
    _id: mentorId,
    company: companyId,
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  const allowedFields = ["designation", "department", "employeeId"];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      mentor[field] = body[field];
    }
  });

  await mentor.save();

  return mentor;
};

export const removeMentorFromCompanyService = async (user, mentorId) => {
  const companyId = user.referenceId;
  const adminId = user._id;

  const mentor = await MentorProfile.findOne({
    _id: mentorId,
    company: companyId,
  });

  if (!mentor) {
    throw new Error("Mentor not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // END EMPLOYMENT HISTORY
    await MentorEmploymentHistory.updateOne(
      {
        mentor: mentorId,
        status: "active",
      },
      {
        endDate: new Date(),
        status: "ended",
        endedBy: adminId,
      },
      { session },
    );

    // CLEAR PROFILE
    mentor.company = null;
    mentor.designation = null;
    mentor.department = null;
    mentor.employeeId = null;
    mentor.status = "unassigned";

    await mentor.save({ session });

    // RESET USER CREDENTIALS
    await User.updateOne(
      { _id: mentor.user },
      {
        password: null,
        isRegistered: false,
        isVerified: false,
        passwordSetupToken: undefined,
        passwordSetupExpires: undefined,
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const getCompanyInternsService = async (user) => {
  if (user.role !== "company") {
    throw new Error("Only company allowed");
  }

  const applications = await Application.find({
    company: user.referenceId,
    status: { $in: ["offer_accepted", "ongoing", "completed"] },
  })
    .populate("student")
    .populate("mentor")
    .populate("internship")
    .lean();

  // 🔥 FETCH REPORTS
  const appIds = applications.map((app) => app._id);

  const reports = await InternshipReport.find({
    application: { $in: appIds },
  }).lean();

  const reportMap = {};
  reports.forEach((r) => {
    reportMap[r.application.toString()] = r;
  });

  // 🔥 ATTACH REPORT
  const finalData = applications.map((app) => {
    const appId = app._id.toString();

    return {
      ...app,
      applicationId: appId,
      report: reportMap[appId] || null,
    };
  });

  return finalData;
};

export const assignMentorService = async (user, applicationId, mentorId) => {
  if (user.role !== "company") {
    throw new Error("Only company allowed");
  }

  const application = await Application.findOne({
    _id: applicationId,
    company: user.referenceId,
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // 🔒 Allow only before internship starts
  if (application.status !== "offer_accepted") {
    throw new Error("Mentor can only be assigned before internship starts");
  }

  application.mentor = mentorId;

  await application.save();

  return application;
};

export const getInternProgressService = async (companyId, applicationId) => {
  const application = await Application.findById(applicationId)
    .populate("student", "fullName email phoneNo")
    .populate("mentor", "fullName email")
    .populate("internship", "title startDate endDate");

  if (!application) {
    throw new Error("Internship record not found");
  }

  if (application.company.toString() !== companyId.toString()) {
    throw new Error("Unauthorized access");
  }

  const tasks = await Task.find({ application: applicationId })
    .sort({ createdAt: -1 })
    .lean();

  const logs = await ProgressLog.find({ application: applicationId })
    .sort({ createdAt: -1 })
    .lean();

  const reports = await InternshipReport.find({ application: applicationId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    application,
    tasks,
    logs,
    reports,
  };
};

export const issueCertificateService = async ({
  applicationId,
  file,
  user,
}) => {
  const application = await Application.findById(applicationId);

  if (!application) {
    throw new Error("Application not found");
  }

  // ✅ FIX: use .equals() for ObjectId comparison
  if (!application.company.equals(user.referenceId)) {
    throw new Error("Unauthorized to issue certificate for this application");
  }

  // 🔥 business rule
  if (application.status !== "completed") {
    throw new Error("Internship not completed yet");
  }

  // ❌ prevent duplicate
  if (application.certificateUrl) {
    throw new Error("Certificate already issued");
  }

  if (!file) {
    throw new Error("Certificate file is required");
  }

  // ☁️ upload
  const result = await uploadToCloudinary(file, "certificates");

  application.certificateUrl = result.secure_url;
  application.certificateIssuedAt = new Date();

  await application.save();

  return application;
};

/*
  ================= GET CERTIFICATE =================
*/
export const getCertificateService = async ({ applicationId, user }) => {
  const application = await Application.findById(applicationId).select(
    "certificateUrl student faculty company",
  );

  if (!application) {
    throw new Error("Application not found");
  }

  // 🔐 access control (FIXED with .equals())
  const isStudent =
    user.role === "student" && application.student?.equals(user.referenceId);

  const isFaculty =
    user.role === "faculty" && application.faculty?.equals(user.referenceId);

  const isCompany =
    user.role === "company" && application.company?.equals(user.referenceId);

  if (!isStudent && !isFaculty && !isCompany) {
    throw new Error("Forbidden");
  }

  if (!application.certificateUrl) {
    throw new Error("Certificate not issued yet");
  }

  return {
    certificateUrl: application.certificateUrl,
  };
};

export const getCompanyDashboardService = async (user) => {
  const companyId = user.referenceId;

  // 1️⃣ Internships
  const totalInternships = await Internship.countDocuments({
    company: companyId,
  });

  // 2️⃣ Applications
  const applications = await Application.find({
    company: companyId,
  });

  const totalApplications = applications.length;

  // 3️⃣ Status counts
  let offerAccepted = 0;
  let ongoing = 0;
  let completed = 0;
  let certificatesIssued = 0;

  applications.forEach((app) => {
    if (app.status === "offer_accepted") offerAccepted++;
    if (app.status === "ongoing") ongoing++;
    if (app.status === "completed") completed++;

    if (app.certificateUrl) certificatesIssued++;
  });

  const totalInterns = offerAccepted + ongoing + completed;

  // 4️⃣ Mentors
  const totalMentors = await MentorProfile.countDocuments({
    company: companyId,
    status: "active",
  });

  // ✅ IMPORTANT: return ALL fields
  return {
    totalInternships,
    totalApplications,
    totalInterns: totalInterns || 0,
    totalMentors: totalMentors || 0,
    completedInternships: completed || 0,
    certificatesIssued: certificatesIssued || 0,
  };
};

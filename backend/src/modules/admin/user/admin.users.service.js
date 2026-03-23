/**
 * admin.users.service.js
 * Pure business logic — no req/res here.
 * Production-grade admin user management for InternStatus.
 */

import crypto from "crypto";
import mongoose from "mongoose";
import User from "../../../models/User.js";
import StudentProfile from "../../../models/StudentProfile.js";
import FacultyProfile from "../../../models/FacultyProfile.js";
import MentorProfile from "../../../models/MentorProfile.js";
import College from "../../../models/College.js";
import Company from "../../../models/Company.js";
import Application from "../../../models/Application.js";
import StudentAcademicHistory from "../../../models/StudentAcademicHistory.js";
import FacultyEmploymentHistory from "../../../models/FacultyEmploymentHistory.js";
import MentorEmploymentHistory from "../../../models/MentorEmploymentHistory.js";
import Internship from "../../../models/Internship.js";
import  sendEmail  from "../../../utils/sendEmail.js"; 
import InternshipReport from "../../../models/InternshipReport.js";
import Task from "../../../models/Task.js";
import TaskSubmission from "../../../models/TaskSubmission.js";
import ProgressLog from "../../../models/ProgressLog.js";


// ─────────────────────────────────────────────────────────────────────────────
// 1. GET ALL USERS (paginated, filtered, searchable)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllUsers = async (filters) => {
  const {
    page,
    limit,
    search,
    role,
    status,
    isVerified,
    isRegistered,
    sortBy,
    sortOrder,
  } = filters;

  const query = {};

  if (search) {
    query.email = { $regex: search, $options: "i" };
  }

  if (role) query.role = role;
  if (status) query.accountStatus = status;
  if (isVerified !== "") query.isVerified = isVerified === "true";
  if (isRegistered !== "") query.isRegistered = isRegistered === "true";

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("email role accountStatus isVerified isRegistered createdAt lastLoginAt referenceModel")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET USER FULL DETAILS (role-specific deep fetch)
// ─────────────────────────────────────────────────────────────────────────────

export const getUserDetails = async (userId) => {
  try {
    // ─────────────────────────────────────────────
    // FETCH USER BASE DATA
    // ─────────────────────────────────────────────
    const user = await User.findById(userId)
      .select("-password -passwordSetupToken -passwordSetupExpires")
      .lean();

    if (!user) {
      return {
        success: false,
        message: "User not found",
        data: null
      };
    }

    let profile = null;
    let organization = null;
    let analytics = null;
    let applications = [];
    let history = [];
    let related = {};

    // ─────────────────────────────────────────────
    // STUDENT
    // ─────────────────────────────────────────────
    if (user.role === "student") {
      profile = await StudentProfile.findOne({ user: userId })
        .populate("college", "name address website emailDomain logoUrl courses")
        .lean();

      if (profile) {
        organization = profile.college || null;

        // HISTORY
        history = await StudentAcademicHistory.find({ student: profile._id })
          .populate("college", "name address")
          .sort({ startDate: -1 })
          .lean()
          .catch(err => {
            console.error("Error fetching student academic history:", err);
            return [];
          });

        // APPLICATIONS
        applications = await Application.find({ student: profile._id })
          .populate({
            path: "internship",
            select:
              "title mode locations durationMonths stipendType stipendAmount startDate applicationDeadline status skillsRequired",
            populate: { path: "company", select: "name logoUrl industry" },
          })
          .populate("company", "name logoUrl industry")
          .populate("mentor", "fullName designation")
          .populate("faculty", "fullName designation")
          .sort({ appliedAt: -1 })
          .lean()
          .catch(err => {
            console.error("Error fetching student applications:", err);
            return [];
          });

        const appIds = applications.map((a) => a._id);

        if (appIds.length > 0) {
          // EXTRA DATA
          const [reports, submissions, logs] = await Promise.all([
            InternshipReport.find({ application: { $in: appIds } }).lean().catch(() => []),
            TaskSubmission.find({ application: { $in: appIds } }).lean().catch(() => []),
            ProgressLog.aggregate([
              { $match: { application: { $in: appIds } } },
              { $group: { _id: "$application", count: { $sum: 1 } } },
            ]).catch(() => []),
          ]);

          const reportMap = {};
          reports.forEach((r) => {
            reportMap[r.application.toString()] = r;
          });

          const submissionMap = {};
          submissions.forEach((s) => {
            const key = s.application.toString();
            if (!submissionMap[key]) submissionMap[key] = [];
            submissionMap[key].push(s);
          });

          const logMap = {};
          logs.forEach((l) => {
            logMap[l._id.toString()] = l.count;
          });

          // ENRICH APPLICATIONS
          applications = applications.map((app) => {
            const id = app._id.toString();
            return {
              ...app,
              report: reportMap[id] || null,
              certificate: app.certificateUrl || null,
              submissions: submissionMap[id] || [],
              progressLogsCount: logMap[id] || 0,
            };
          });
        }

        // ANALYTICS
        const agg = await Application.aggregate([
          { $match: { student: profile._id } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]).catch(() => []);

        const map = {};
        agg.forEach((a) => (map[a._id] = a.count));

        analytics = {
          totalApplications: applications.length,
          applied: map.applied || 0,
          shortlisted: map.shortlisted || 0,
          selected: map.selected || 0,
          ongoing: map.ongoing || 0,
          completed: map.completed || 0,
          rejected: map.rejected || 0,
        };
      }
    }

    // ─────────────────────────────────────────────
    // FACULTY
    // ─────────────────────────────────────────────
    else if (user.role === "faculty") {
      profile = await FacultyProfile.findOne({ user: userId })
        .populate("college", "name address")
        .lean();

      if (profile && profile.college) {
        organization = profile.college;

        history = await FacultyEmploymentHistory.find({ faculty: profile._id })
          .populate("college", "name")
          .sort({ startDate: -1 })
          .lean()
          .catch(() => []);

        // ✅ FIX: Fetch students for this college
        related.students = await StudentProfile.find({ college: profile.college._id })
          .select("fullName prn courseName specialization status")
          .lean()
          .catch(() => []);

        const [students, faculty] = await Promise.all([
          StudentProfile.countDocuments({ college: profile.college._id }).catch(() => 0),
          FacultyProfile.countDocuments({ college: profile.college._id }).catch(() => 0),
        ]);

        analytics = { students, faculty };
      } else {
        analytics = { students: 0, faculty: 0 };
        related.students = [];
      }
    }

    // ─────────────────────────────────────────────
    // MENTOR
    // ─────────────────────────────────────────────
    else if (user.role === "mentor") {
      profile = await MentorProfile.findOne({ user: userId })
        .populate("company", "name logoUrl")
        .lean();

      if (profile) {
        organization = profile.company;

        history = await MentorEmploymentHistory.find({ mentor: profile._id })
          .populate("company", "name")
          .sort({ startDate: -1 })
          .lean()
          .catch(() => []);

        const [ongoing, completed] = await Promise.all([
          Application.countDocuments({ mentor: profile._id, status: "ongoing" }).catch(() => 0),
          Application.countDocuments({ mentor: profile._id, status: "completed" }).catch(() => 0),
        ]);

        applications = await Application.find({ mentor: profile._id })
          .populate("student", "fullName prn")
          .populate("internship", "title")
          .limit(20)
          .lean()
          .catch(() => []);

        analytics = { ongoing, completed };
      }
    }

    // ─────────────────────────────────────────────
    // COLLEGE
    // ─────────────────────────────────────────────
    else if (user.role === "college") {
      const college = await College.findById(user.referenceId).lean();
      profile = college;
      organization = college;

      if (college) {
        const [students, faculty] = await Promise.all([
          StudentProfile.countDocuments({ college: college._id }).catch(() => 0),
          FacultyProfile.countDocuments({ college: college._id }).catch(() => 0),
        ]);

        related.students = await StudentProfile.find({ college: college._id })
          .select("fullName prn courseName specialization status")
          .limit(50)
          .lean()
          .catch(() => []);

        related.faculty = await FacultyProfile.find({ college: college._id })
          .select("fullName designation department status")
          .lean()
          .catch(() => []);

        analytics = { students, faculty };
      }
    }

    // ─────────────────────────────────────────────
    // COMPANY
    // ─────────────────────────────────────────────
    else if (user.role === "company") {
      const company = await Company.findById(user.referenceId).lean();
      profile = company;
      organization = company;

      if (company) {
        // ✅ FIX: Fetch all mentors for this company
        related.mentors = await MentorProfile.find({ company: company._id })
          .select("fullName designation department status")
          .lean()
          .catch(() => []);

        const internships = await Internship.find({ company: company._id })
          .lean()
          .catch(() => []);
        
        const internshipIds = internships.map((i) => i._id);

        const apps = await Application.find({
          internship: { $in: internshipIds },
        })
          .populate("student", "fullName prn")
          .select("internship status appliedAt student")
          .lean()
          .catch(() => []);

        const appMap = {};
        apps.forEach((a) => {
          const key = a.internship.toString();
          if (!appMap[key]) appMap[key] = [];
          appMap[key].push(a);
        });

        related.internships = internships.map((i) => ({
          ...i,
          applicantCount: (appMap[i._id.toString()] || []).length,
          applicants: (appMap[i._id.toString()] || []).map((a) => ({
            _id: a._id,
            status: a.status,
            appliedAt: a.appliedAt,
            student: a.student,
          })),
        }));

        analytics = {
          totalInternships: internships.length,
          totalApplications: apps.length,
        };
      }
    }

    // ─────────────────────────────────────────────
    // ADMIN
    // ─────────────────────────────────────────────
    else if (user.role === "admin") {
      analytics = { note: "Admin user" };
    }

    return {
      success: true,
      data: {
        user,
        profile,
        organization,
        analytics,
        applications,
        history,
        related,
      }
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch user details",
      data: null
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. UPDATE USER STATUS
// ─────────────────────────────────────────────────────────────────────────────
export const updateUserStatus = async (userId, accountStatus) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { accountStatus },
    { new: true }
  ).select("email role accountStatus isVerified isRegistered updatedAt");

  return user;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. RESEND INVITE
// ─────────────────────────────────────────────────────────────────────────────
export const resendInvite = async (userId) => {
  const user = await User.findById(userId);

  if (!user) return { error: "User not found" };
  if (user.isRegistered) return { error: "User has already completed registration" };
  if (user.accountStatus === "deleted") return { error: "Cannot invite deleted user" };

  // Generate secure token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

  user.passwordSetupToken = hashedToken;
  user.passwordSetupExpires = expiry;
  await user.save();

  const setupLink = `${process.env.FRONTEND_URL}/setup-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Complete Your InternStatus Registration",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to InternStatus</h2>
        <p>You've been invited as a <strong>${user.role}</strong>. Click the link below to set up your account.</p>
        <a href="${setupLink}" style="
          display: inline-block;
          background: #4F46E5;
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          margin: 20px 0;
        ">Complete Registration</a>
        <p>This link expires in <strong>48 hours</strong>.</p>
        <p style="color: #888; font-size: 12px;">If you didn't expect this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { message: `Invite sent to ${user.email}` };
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. UPDATE USER PROFILE (admin can patch profile fields)
// ─────────────────────────────────────────────────────────────────────────────
export const updateUserProfile = async (userId, body) => {
  const user = await User.findById(userId).lean();
  if (!user) return null;

  const { role } = user;

  // Allowed fields per role (prevent mass assignment)
  const ALLOWED = {
    student: ["fullName", "phoneNo", "bio", "skills", "courseName", "specialization", "courseStartYear", "courseEndYear"],
    faculty: ["fullName", "phoneNo", "bio", "designation", "department", "joiningYear", "employeeId"],
    mentor: ["fullName", "phoneNo", "bio", "designation", "department", "employeeId"],
    college: ["name", "address", "phone", "website", "description"],
    company: ["name", "website", "industry", "companySize", "description"],
    admin: [],
  };

  const allowed = ALLOWED[role] || [];
  const updateData = {};
  allowed.forEach((field) => {
    if (body[field] !== undefined) updateData[field] = body[field];
  });

  if (Object.keys(updateData).length === 0) return { message: "No valid fields to update" };

  let updated;
  if (role === "student") {
    updated = await StudentProfile.findOneAndUpdate({ user: userId }, updateData, { new: true }).lean();
  } else if (role === "faculty") {
    updated = await FacultyProfile.findOneAndUpdate({ user: userId }, updateData, { new: true }).lean();
  } else if (role === "mentor") {
    updated = await MentorProfile.findOneAndUpdate({ user: userId }, updateData, { new: true }).lean();
  } else if (role === "college") {
    updated = await College.findByIdAndUpdate(user.referenceId, updateData, { new: true }).lean();
  } else if (role === "company") {
    updated = await Company.findByIdAndUpdate(user.referenceId, updateData, { new: true }).lean();
  }

  return updated;
};
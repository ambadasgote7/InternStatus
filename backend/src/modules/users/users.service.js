import crypto from "crypto";
import mongoose from "mongoose";

import User from "../../models/User.js";
import StudentProfile from "../../models/StudentProfile.js";
import FacultyProfile from "../../models/FacultyProfile.js";
import MentorProfile from "../../models/MentorProfile.js";
import College from "../../models/College.js";

import createUserWithToken from "../../utils/createUser.js";
import sendEmail from "../../utils/sendEmail.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

import FacultyEmploymentHistory from "../../models/FacultyEmploymentHistory.js";
import MentorEmploymentHistory from "../../models/MentorEmploymentHistory.js";
import StudentAcademicHistory from "../../models/StudentAcademicHistory.js";


// =====================================================
// RESOLVE COLLEGE FROM CREATOR
// =====================================================

const resolveCollegeId = async (creator, session) => {

  if (creator.role === "college") {
    return creator.referenceId;
  }

  if (creator.role === "faculty") {

    const faculty = await FacultyProfile.findById(
      creator.referenceId
    ).session(session);

    if (!faculty) {
      throw new Error("Faculty profile not found");
    }

    return faculty.college;
  }

  throw new Error("Admin cannot directly invite student");
};


// =====================================================
// SINGLE STUDENT INVITE LOGIC
// =====================================================

const inviteOneStudent = async (body, creator, session) => {

  const {
    email,
    fullName,
    courseName,
    specialization,
    courseStartYear,
    courseEndYear,
    Year
  } = body;

  if (!email || !fullName || !Year) {
    throw new Error("Email, full name and Year required");
  }

  const collegeId = await resolveCollegeId(creator, session);

  if (!collegeId) {
    throw new Error("College not resolved");
  }

  // 🔥 GET COLLEGE + COURSE (CRITICAL FIX)
  const college = await College.findById(collegeId).session(session);

  if (!college) {
    throw new Error("College not found");
  }

  const course = college.courses.find(
    c => c.name === courseName
  );

  if (!course) {
    throw new Error(`Course not found: ${courseName}`);
  }

  const courseId = course._id; // ✅ REQUIRED

  let user;
  let studentProfile;
  let rawToken;
  let isNewUser = false;

  user = await User.findOne({ email }).session(session);

  // =====================================================
  // EXISTING USER
  // =====================================================
  if (user) {

    if (user.role !== "student") {
      throw new Error("User already exists with different role");
    }

    const result = await createUserWithToken(
      {
        email,
        role: "student",
        referenceModel: "StudentProfile",
        createdBy: creator._id
      },
      session
    );

    rawToken = result.rawToken;
    user = result.user;

    if (user.referenceId) {
      studentProfile = await StudentProfile
        .findById(user.referenceId)
        .session(session);
    }

    // 🔥 SELF HEAL CREATE
    if (!studentProfile) {

      const profile = await StudentProfile.create(
        [{
          user: user._id,
          fullName,
          college: collegeId,

          courseId,              // ✅ FIXED
          courseName,
          specialization,

          courseStartYear,
          courseEndYear,
          Year,

          status: "active",
          profileStatus: "pending",
          createdBy: creator._id
        }],
        { session }
      );

      studentProfile = profile[0];

      user.referenceId = studentProfile._id;
      await user.save({ session });

    } else {

      // 🔥 UPDATE EXISTING PROFILE
      studentProfile.fullName = fullName;
      studentProfile.college = collegeId;

      studentProfile.courseId = courseId;   // ✅ FIXED
      studentProfile.courseName = courseName;

      studentProfile.specialization = specialization;
      studentProfile.courseStartYear = courseStartYear;
      studentProfile.courseEndYear = courseEndYear;
      studentProfile.Year = Year;
      studentProfile.status = "active";

      await studentProfile.save({ session });
    }
  }

  // =====================================================
  // NEW USER
  // =====================================================
  else {

    isNewUser = true;

    const result = await createUserWithToken(
      {
        email,
        role: "student",
        referenceModel: "StudentProfile",
        createdBy: creator._id
      },
      session
    );

    user = result.user;
    rawToken = result.rawToken;

    const profile = await StudentProfile.create(
      [{
        user: user._id,
        fullName,
        college: collegeId,

        courseId,              // ✅ FIXED
        courseName,
        specialization,

        courseStartYear,
        courseEndYear,
        Year,

        status: "active",
        profileStatus: "pending",
        createdBy: creator._id
      }],
      { session }
    );

    studentProfile = profile[0];

    user.referenceId = studentProfile._id;
    await user.save({ session });
  }

  // =====================================================
  // ACADEMIC HISTORY
  // =====================================================
  await StudentAcademicHistory.create(
    [{
      student: studentProfile._id,
      college: collegeId,
      courseName,
      specialization,
      startDate: new Date(),
      Year,
      status: "active",
      addedBy: creator._id
    }],
    { session }
  );

  // =====================================================
  // EMAIL
  // =====================================================
  const setupLink =
    `${process.env.FRONTEND_URL}/setup-account?token=${rawToken}`;

  if (rawToken) {
    await sendEmail({
      to: email,
      subject: isNewUser
        ? "Student Account Invitation"
        : "College Assignment Updated",
      html: `
        <p>You have been invited as Student.</p>
        <p>Complete setup using the link below:</p>
        <a href="${setupLink}">${setupLink}</a>
      `
    });
  }

  return studentProfile;
};


// =====================================================
// MAIN SERVICE — SINGLE OR BULK
// =====================================================

export const inviteStudentService = async (payload, creator) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    let results = [];

    // SINGLE
    if (!Array.isArray(payload)) {

      const student = await inviteOneStudent(
        payload,
        creator,
        session
      );

      results.push(student);
    }

    // BULK
    else {

      for (const body of payload) {

        const student = await inviteOneStudent(
          body,
          creator,
          session
        );

        results.push(student);
      }
    }

    await session.commitTransaction();
    session.endSession();

    return results;

  } catch (err) {

    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ======================================================
   INVITE FACULTY  (WITH EMPLOYMENT HISTORY)
====================================================== */

export const inviteFacultyService = async (body, creator) => {

  const {
    email,
    fullName,
    courseName,
    specialization,
    designation
  } = body;

  if (!email || !fullName) {
    throw new Error("Email and full name required");
  }

  const collegeId = creator.referenceId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    let user;
    let facultyProfile;
    let rawToken = null;
    let isNewUser = false;


    // =====================================================
    // CHECK USER
    // =====================================================

    user = await User.findOne({ email }).session(session);


    // =====================================================
    // USER EXISTS
    // =====================================================

    if (user) {

      if (user.role !== "faculty") {
        throw new Error("User already exists with different role");
      }

      // regenerate setup token for reassignment
      const result = await createUserWithToken(
        {
          email,
          role: "faculty",
          referenceModel: "FacultyProfile",
          createdBy: creator._id
        },
        session
      );

      rawToken = result.rawToken;
      user = result.user;


      // Try load profile
      if (user.referenceId) {
        facultyProfile = await FacultyProfile
          .findById(user.referenceId)
          .session(session);
      }

      // SELF HEAL PROFILE IF MISSING
      if (!facultyProfile) {

        const profile = await FacultyProfile.create(
          [{
            user: user._id,
            fullName,
            college: collegeId,
            courseName,
            department : specialization,
            designation,
            status: "active",
            profileStatus: "pending",
            createdBy: creator._id
          }],
          { session }
        );

        facultyProfile = profile[0];

        user.referenceId = facultyProfile._id;
        await user.save({ session });

      } else {

        // Reassign existing faculty
        facultyProfile.college = collegeId;
        facultyProfile.courseName = courseName;
        facultyProfile.department = specialization;
        facultyProfile.designation = designation;
        facultyProfile.status = "active";

        await facultyProfile.save({ session });
      }

    }


    // =====================================================
    // NEW USER
    // =====================================================

    else {

      isNewUser = true;

      const result = await createUserWithToken(
        {
          email,
          role: "faculty",
          referenceModel: "FacultyProfile",
          createdBy: creator._id
        },
        session
      );

      user = result.user;
      rawToken = result.rawToken;

      const profile = await FacultyProfile.create(
        [{
          user: user._id,
          fullName,
          college: collegeId,
          courseName,
          department : specialization,
          designation,
          status: "active",
          profileStatus: "pending",
          createdBy: creator._id
        }],
        { session }
      );

      facultyProfile = profile[0];

      user.referenceId = facultyProfile._id;
      await user.save({ session });
    }


    // =====================================================
    // EMPLOYMENT HISTORY
    // =====================================================

    await FacultyEmploymentHistory.create(
      [{
        faculty: facultyProfile._id,
        college: collegeId,
        courseName,
        department : specialization,
        designation,
        startDate: new Date(),
        status: "active",
        addedBy: creator._id
      }],
      { session }
    );


    await session.commitTransaction();
    session.endSession();


    // =====================================================
    // EMAIL
    // =====================================================

    const setupLink =
      `${process.env.FRONTEND_URL}/setup-account?token=${rawToken}`;

    if (isNewUser) {

      await sendEmail({
        to: email,
        subject: "Faculty Account Invitation",
        html: `
          <p>You have been invited as Faculty.</p>
          <p>Please set your password using the link below:</p>
          <a href="${setupLink}">${setupLink}</a>
        `
      });

    } else {

      await sendEmail({
        to: email,
        subject: "College Assignment Updated",
        html: `
          <p>You have been assigned to a college in InternStatus.</p>
          <p>Please complete your setup using the link below:</p>
          <a href="${setupLink}">${setupLink}</a>
        `
      });

    }


    return facultyProfile;

  } catch (err) {

    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};



/* ======================================================
   INVITE MENTOR  (WITH EMPLOYMENT HISTORY)
====================================================== */

export const inviteMentorService = async (body, creator) => {

  const {
    email,
    fullName,
    designation,
    department,
    employeeId
  } = body;

  if (!email || !fullName) {
    throw new Error("Email and full name required");
  }

  const companyId = creator.referenceId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    let user;
    let mentorProfile;
    let rawToken;

    // ================= USER CHECK =================

    user = await User.findOne({ email }).session(session);

    // ================= EXISTING USER =================

    if (user) {

      if (user.role !== "mentor") {
        throw new Error("User already exists with different role");
      }

      const result = await createUserWithToken(
        {
          email,
          role: "mentor",
          referenceModel: "MentorProfile",
          createdBy: creator._id
        },
        session
      );

      rawToken = result.rawToken;
      user = result.user;

      if (user.referenceId) {
        mentorProfile = await MentorProfile
          .findById(user.referenceId)
          .session(session);
      }

      // SELF HEAL
      if (!mentorProfile) {

        const profile = await MentorProfile.create(
          [{
            user: user._id,
            fullName,
            company: companyId,
            designation,
            department,
            employeeId,
            status: "active",
            profileStatus: "pending",
            createdBy: creator._id
          }],
          { session }
        );

        mentorProfile = profile[0];

        user.referenceId = mentorProfile._id;
        await user.save({ session });

      } else {

        mentorProfile.company = companyId;
        mentorProfile.designation = designation;
        mentorProfile.department = department;
        mentorProfile.employeeId = employeeId;
        mentorProfile.status = "active";

        await mentorProfile.save({ session });
      }

    }

    // ================= NEW USER =================

    else {

      const result = await createUserWithToken(
        {
          email,
          role: "mentor",
          referenceModel: "MentorProfile",
          createdBy: creator._id
        },
        session
      );

      user = result.user;
      rawToken = result.rawToken;

      const profile = await MentorProfile.create(
        [{
          user: user._id,
          fullName,
          company: companyId,
          designation,
          department,
          employeeId,
          status: "active",
          profileStatus: "pending",
          createdBy: creator._id
        }],
        { session }
      );

      mentorProfile = profile[0];

      user.referenceId = mentorProfile._id;
      await user.save({ session });
    }

    // ================= EMPLOYMENT HISTORY =================

    await MentorEmploymentHistory.create(
      [{
        mentor: mentorProfile._id,
        company: companyId,
        designation,
        department,
        startDate: new Date(),
        status: "active",
        addedBy: creator._id
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // ================= EMAIL =================

    const setupLink =
      `${process.env.FRONTEND_URL}/setup-account?token=${rawToken}`;

    await sendEmail({
      to: email,
      subject: "Mentor Invitation",
      html: `
        <p>You have been assigned as Mentor.</p>
        <p>Complete setup using link below:</p>
        <a href="${setupLink}">${setupLink}</a>
      `
    });

    return mentorProfile;

  } catch (err) {

    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ======================================================
   GET SETUP DATA
====================================================== */

export const getSetupDataService = async (token) => {
  const hashed = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordSetupToken: hashed,
    passwordSetupExpires: { $gt: Date.now() }
  });

  if (!user) throw new Error("Invalid or expired token");

  let profile;

  if (user.role === "student") {
    profile = await StudentProfile.findById(user.referenceId)
      .populate("college", "name");
  }

  if (user.role === "faculty") {
    profile = await FacultyProfile.findById(user.referenceId)
      .populate("college", "name");
  }

  return {
    role: user.role,
    email: user.email,
    profile
  };
};

/* ======================================================
   SETUP ACCOUNT (PASSWORD + PROFILE)
====================================================== */

export const setupAccountService = async ({ body, files }) => {
  const { token, password } = body;

  if (!token || !password) {
    throw new Error("Token and password are required");
  }

  // =============================
  // Parse profileData safely
  // =============================
  let profileData = body.profileData;

  if (typeof profileData === "string") {
    try {
      profileData = JSON.parse(profileData);
    } catch {
      profileData = {};
    }
  }

  if (!profileData) profileData = {};

  // =============================
  // Verify token
  // =============================
  const hashed = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    passwordSetupToken: hashed,
    passwordSetupExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new Error("Invalid or expired setup link");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // =============================
    // Update User
    // =============================
    user.password = password;
    user.passwordSetupToken = undefined;
    user.passwordSetupExpires = undefined;
    user.isRegistered = true;
    user.isVerified = true;

    await user.save({ session });

    /* =====================================================
       STUDENT
    ===================================================== */

    if (user.role === "student") {

      const profile = await StudentProfile
        .findById(user.referenceId)
        .session(session);

      if (!profile) throw new Error("Student profile not found");

      // -----------------------------
      // ABC ID (MANDATORY)
      // -----------------------------
      if (!profileData.abcId) {
        throw new Error("ABC ID is required");
      }

      if (!/^\d{12}$/.test(profileData.abcId)) {
        throw new Error("ABC ID must be a 12-digit number");
      }

      if (profile.abcId) {
        throw new Error("ABC ID already set and cannot be changed");
      }

      profile.abcId = profileData.abcId;

      // -----------------------------
      // PRN (lock once provided)
      // -----------------------------
      if (profileData.prn) {
        profile.prn = profileData.prn;
        profile.prnLocked = true;
      }

      profile.phoneNo = profileData.phoneNo || profile.phoneNo;
      profile.skills = profileData.skills || [];
      profile.bio = profileData.bio || "";

      // Resume Upload
      if (files?.resume?.[0]) {
        const upload = await uploadToCloudinary(
          files.resume[0],
          "student-resumes"
        );
        profile.resumeUrl = upload.secure_url;
      }

      // College ID Upload
      if (files?.collegeIdCard?.[0]) {
        const upload = await uploadToCloudinary(
          files.collegeIdCard[0],
          "student-id-cards"
        );
        profile.collegeIdCardUrl = upload.secure_url;
      }

      profile.profileStatus = "completed";
      profile.profileCompletedAt = new Date();

      await profile.save({ session });
    }

    /* =====================================================
       FACULTY
    ===================================================== */

    if (user.role === "faculty") {

      const profile = await FacultyProfile
        .findById(user.referenceId)
        .session(session);

      if (!profile) throw new Error("Faculty profile not found");

      profile.phoneNo = profileData.phoneNo || profile.phoneNo;
      profile.designation = profileData.designation || profile.designation;

      profile.profileStatus = "completed";
      profile.profileCompletedAt = new Date();

      await profile.save({ session });
    }

    /* =====================================================
       MENTOR
    ===================================================== */

    if (user.role === "mentor") {

      const profile = await MentorProfile
        .findById(user.referenceId)
        .session(session);

      if (!profile) throw new Error("Mentor profile not found");

      profile.phoneNo = profileData.phoneNo || profile.phoneNo;
      profile.designation = profileData.designation || profile.designation;
      profile.department = profileData.department || profile.department;

      profile.status = "active";

      await profile.save({ session });
    }

    await session.commitTransaction();

    return {
      success: true,
      message: "Account setup successful"
    };

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};
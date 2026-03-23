import StudentProfile from "../../models/StudentProfile.js";
import StudentAcademicHistory from "../../models/StudentAcademicHistory.js";
import User from "../../models/User.js";
import mongoose from "mongoose";
import InternshipReport from "../../models/InternshipReport.js";
import College from "../../models/College.js";

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


export const searchStudentService = async (query, user) => {

  if (!query) {
    throw new Error("Search query required");
  }

  let filter = {};

  if (/^\d{12}$/.test(query)) {
    filter.abcId = query;
  } else {
    filter.fullName = { $regex: query, $options: "i" };
  }

  // 🔒 COLLEGE RESTRICTION
  if (user.role === "college") {
    filter.college = user.referenceId;
  }

  const student = await StudentProfile.findOne(filter)
    .select("fullName abcId college");

  if (!student) {
    throw new Error("Student not found or not in your college");
  }

  return student;
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
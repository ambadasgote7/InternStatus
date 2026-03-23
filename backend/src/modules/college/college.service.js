import College from "../../models/College.js";
import FacultyEmploymentHistory from "../../models/FacultyEmploymentHistory.js";
import FacultyProfile from "../../models/FacultyProfile.js";
import User from "../../models/User.js";
import createUserWithToken from "../../utils/createUser.js";


/* ======================================
   GET COURSES
====================================== */

export const getCoursesService = async (user) => {
  const collegeId = user.referenceId;

  const college = await College.findById(collegeId);

  if (!college) throw new Error("College not found");

  return college.courses;
};


/* ======================================
   ADD COURSE
====================================== */

export const addCourseService = async (user, body) => {

  if (user.role !== "college") {
    throw new Error("Unauthorized");
  }

  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  // 🔥 NORMALIZE BODY (CRITICAL FIX)
  let payload = body;

  if (body.data) {
    if (Array.isArray(body.data)) {
      payload = body.data[0] || {};
    } else {
      payload = body.data;
    }
  }

  let { name, durationYears, specializations, credits } = payload;

  // 🔥 FORCE TYPE CONVERSION
  durationYears = Number(durationYears);
  credits = Number(credits);

  // ================= VALIDATION =================
  if (!name || !name.trim()) {
    throw new Error("Course name is required");
  }

  if (!durationYears || durationYears <= 0) {
    throw new Error("Valid duration is required");
  }

  if (
    credits === undefined ||
    credits === null ||
    isNaN(credits) ||
    credits < 0
  ) {
    throw new Error("Valid credits required");
  }

  const collegeId = user.referenceId;

  const college = await College.findById(collegeId);

  if (!college) {
    throw new Error("College not found");
  }

  // ================= DUPLICATE CHECK =================
  const exists = college.courses.find(
    c => c.name.toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    throw new Error("Course already exists");
  }

  // ================= CLEAN DATA =================
  const cleanSpecializations = Array.isArray(specializations)
    ? specializations.map(s => s.trim()).filter(Boolean)
    : [];

  // ================= ADD COURSE =================
  college.courses.push({
    name: name.trim(),
    durationYears,
    credits,
    specializations: cleanSpecializations
  });

  await college.save();

  return college.courses;
};

/* ======================================
   UPDATE COURSE
====================================== */

export const updateCourseService = async (
  user,
  courseId,
  body
) => {

  if (user.role !== "college") {
    throw new Error("Unauthorized");
  }

  const collegeId = user.referenceId;

  const college = await College.findById(collegeId);

  if (!college) {
    throw new Error("College not found");
  }

  const course = college.courses.id(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  // ================= UPDATE FIELDS =================

  if (body.name) {
    const nameExists = college.courses.find(
      c =>
        c.name.toLowerCase() === body.name.toLowerCase() &&
        c._id.toString() !== courseId
    );

    if (nameExists) {
      throw new Error("Course with this name already exists");
    }

    course.name = body.name.trim();
  }

  if (body.durationYears !== undefined) {
    if (body.durationYears <= 0) {
      throw new Error("Invalid duration");
    }
    course.durationYears = Number(body.durationYears);
  }

  if (body.credits !== undefined) {
    if (body.credits < 0) {
      throw new Error("Invalid credits");
    }
    course.credits = Number(body.credits);
  }

  if (body.specializations) {
    course.specializations = Array.isArray(body.specializations)
      ? body.specializations.map(s => s.trim()).filter(Boolean)
      : [];
  }

  await college.save();

  return college.courses;
};


/* ======================================
   DELETE COURSE
====================================== */

export const deleteCourseService = async (
  user,
  courseName
) => {

  const collegeId = user.referenceId;

  const college = await College.findById(collegeId);

  if (!college) throw new Error("College not found");

  college.courses = college.courses.filter(
    c => c.name !== courseName
  );

  await college.save();

  return college.courses;
};


export const getCollegeListService = async () => {

  const colleges = await College.find(
    { status: "active" },
    "_id name"
  ).sort({ name: 1 });

  return colleges;
};

// ================= GET PROFILE =================
export const getCollegeProfileService = async (user, collegeId) => {

  let id;

  if (user.role === "admin" && collegeId) {
    id = collegeId;               // admin viewing any
  } else {
    id = user.referenceId;        // college viewing own
  }

  const college = await College.findById(id);

  if (!college) {
    throw new Error("College not found");
  }

  return college;
};


// ================= UPDATE PROFILE =================
export const updateCollegeProfileService = async (
  user,
  body,
  collegeId
) => {

  let id;

  if (user.role === "admin" && collegeId) {
    id = collegeId;
  } else {
    id = user.referenceId;
  }

  const college = await College.findById(id);

  if (!college) {
    throw new Error("College not found");
  }


  // Editable fields
  const allowedFields = [
    "name",
    "website",
    "phone",
    "address",
    "description"
  ];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      college[field] = body[field];
    }
  });

  await college.save();

  return college;
};


export const getCollegeFacultyService = async (user) => {
  const collegeId = user.referenceId;

  const faculty = await FacultyProfile.find({
    college: collegeId,
    status: "active"
  })
    .populate("user", "email")
    .lean();

  return faculty;
};

export const updateCollegeFacultyService = async (
  user,
  facultyId,
  body
) => {

  const collegeId = user.referenceId;

  const faculty = await FacultyProfile.findOne({
    _id: facultyId,
    college: collegeId
  });

  if (!faculty) {
    throw new Error("Faculty not found");
  }


  const allowedFields = [
    "courseName",
    "department",   // ✅ correct field
    "designation",
    "employeeId",
    "joiningYear"
  ];


  let academicChanged = false;


  allowedFields.forEach((field) => {

    if (body[field] !== undefined) {

      if (faculty[field] !== body[field]) {
        faculty[field] = body[field];

        if (["courseName", "specialization", "designation"].includes(field)) {
          academicChanged = true;
        }
      }
    }
  });


  await faculty.save();


  // =============================
  // UPDATE EMPLOYMENT HISTORY SNAPSHOT
  // =============================

  if (academicChanged) {

    await FacultyEmploymentHistory.updateOne(
      {
        faculty: facultyId,
        status: "active"
      },
      {
        courseName: faculty.courseName,
        specialization: faculty.department,
        designation: faculty.designation
      }
    );
  }


  return faculty;
};


export const removeFacultyFromCollegeService = async (
  user,
  facultyId
) => {

  const collegeId = user.referenceId;
  const adminId = user._id;

  const faculty = await FacultyProfile.findOne({
    _id: facultyId,
    college: collegeId
  });

  if (!faculty) {
    throw new Error("Faculty not found");
  }

  // =============================
  // END EMPLOYMENT HISTORY
  // =============================

  const history = await FacultyEmploymentHistory.findOne({
    faculty: facultyId,
    status: "active"
  });

  if (history) {
    history.endDate = new Date();
    history.status = "ended";
    history.endedBy = adminId;
    await history.save();
  }


  // =============================
  // CLEAR FACULTY DATA
  // =============================

  faculty.college = null;
  faculty.courseName = null;
  faculty.department = null;
  faculty.specialization = null;
  faculty.designation = null;
  faculty.employeeId = null;
  faculty.joiningYear = null;
  faculty.status = "unassigned";

  await faculty.save();


  // =============================
  // UPDATE USER (DISABLE LOGIN)
  // =============================

  const userDoc = await User.findById(faculty.user);

  if (userDoc) {

    userDoc.password = null;
    userDoc.isRegistered = false;
    userDoc.isVerified = false;

    // create fresh setup token
    const { rawToken } = await createUserWithToken({
      email: userDoc.email,
      role: "faculty",
      referenceModel: "FacultyProfile",
      createdBy: adminId
    });

    userDoc.passwordSetupToken =
      userDoc.passwordSetupToken; // already set by util

    await userDoc.save();
  }

  return { success: true };
};

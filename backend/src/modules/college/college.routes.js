import express from "express";
import {
  addCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  getCollegeProfile,
  updateCollegeProfile,
  getCollegeList,
  getCollegeFaculty,
  updateCollegeFaculty,
  removeFacultyFromCollege,
} from "./college.controller.js";

import { authenticate } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";

import {
  assignCredits,
  getCollegeStudents,
  getStudentReports,
  removeStudentFromCollege,
  searchStudent,
  updateCollegeStudent
} from "./college.student.controller.js";

const router = express.Router();

/*
  ================= PUBLIC =================
*/
router.get("/list", getCollegeList);

/*
  ================= COLLEGE PROFILE =================
*/
router.get(
  "/profile",
  authenticate,
  authorizeRoles("college", "admin"),
  getCollegeProfile
);

router.patch(
  "/profile",
  authenticate,
  authorizeRoles("college", "admin"),
  updateCollegeProfile
);

/*
  ================= COURSES =================
*/
router.get("/courses", authenticate, authorizeRoles("college"), getCourses);
router.post("/courses", authenticate, authorizeRoles("college"), addCourse);
router.patch(
  "/courses/:courseId",
  authenticate,
  authorizeRoles("college"),
  updateCourse
);
router.delete("/courses/:courseName", authenticate, authorizeRoles("college"), deleteCourse);

/*
  ================= FACULTY =================
*/
router.get(
  "/faculty",
  authenticate,
  authorizeRoles("college"),
  getCollegeFaculty
);

router.patch(
  "/faculty/:facultyId",
  authenticate,
  authorizeRoles("college"),
  updateCollegeFaculty
);

router.delete(
  "/faculty/:facultyId",
  authenticate,
  authorizeRoles("college"),
  removeFacultyFromCollege
);

/*
  ================= STUDENT SEARCH (STATIC FIRST) =================
*/
router.get(
  "/students/search",
  authenticate,
  authorizeRoles("college", "faculty"),
  searchStudent
);


/*
  ================= STUDENT REPORTS =================
*/
router.get(
  "/students/:studentId/reports",
  authenticate,
  authorizeRoles("college", "faculty"),
  getStudentReports
);

/*
  ================= STUDENT MANAGEMENT =================
*/
router.get(
  "/students",
  authenticate,
  authorizeRoles("college"),
  getCollegeStudents
);

router.patch(
  "/students/:studentId",
  authenticate,
  authorizeRoles("college"),
  updateCollegeStudent
);

router.delete(
  "/students/:studentId",
  authenticate,
  authorizeRoles("college"),
  removeStudentFromCollege
);

/*
  ================= CREDIT SYSTEM =================
  */


router.post(
  "/reports/:reportId/credits",
  authenticate,
  authorizeRoles("college", "faculty"),
  assignCredits
);

/*
  ================= ADMIN ACCESS =================
*/
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  getCollegeProfile
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  updateCollegeProfile
);

export default router;
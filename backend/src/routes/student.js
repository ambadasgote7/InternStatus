// routes/student.js
import express from "express";
import userAuth from "../middlewares/auth.js";
import {authorizeRoles} from "../middlewares/role.js";
import { upload } from "../middlewares/upload.js";
import {
  getStudentDashboard,
  getMyStudentProfile,
  submitStudentProfile,
} from "../controllers/studentController.js";

const studentRouter = express.Router();

// Student dashboard (only verified should normally reach this in UI)
studentRouter.get(
  "/dashboard",
  userAuth,
  authorizeRoles("Student"),
  getStudentDashboard
);

// Get logged-in student's profile (draft/pending/verified/rejected)
studentRouter.get(
  "/profile",
  userAuth,
  authorizeRoles("Student"),
  getMyStudentProfile
);

// Create or update student's profile and mark it pending for faculty verification
studentRouter.post(
  "/profile",
  userAuth,
  authorizeRoles("Student"),
  upload.fields([
    { name: "collegeIdFile", maxCount: 1 },
    { name: "resumeFile", maxCount: 1 },
  ]),
  submitStudentProfile
);

export default studentRouter;

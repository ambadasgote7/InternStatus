import express from "express";
import { authenticate } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";

import {
  getStudentCredits,
  getStudentDetails,
  getStudentInternships,
  getStudentInternshipStats,
  getStudentInternshipTrack
} from "./student.controller.js";

const router = express.Router();

router.get(
  "/credits",
  authenticate,
  authorizeRoles("student"),
  getStudentCredits
);

router.get(
  "/internship/:applicationId/track",
  authenticate,
  authorizeRoles("student"),
  getStudentInternshipTrack
);

router.get("/:studentId", getStudentDetails);

router.get("/:studentId/stats", getStudentInternshipStats);

router.get("/:studentId/internships", getStudentInternships);



export default router;
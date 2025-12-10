// routes/student.js
import express from "express";
import userAuth from "../middlewares/auth.js";
import authorizeRoles from "../middlewares/role.js";
import { getStudentDashboard } from "../controllers/studentController.js";

const studentRouter = express.Router();

studentRouter.get(
  "/api/student/dashboard",
  userAuth,
  authorizeRoles("Student"),
  getStudentDashboard
);

export default studentRouter;

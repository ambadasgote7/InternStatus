// routes/faculty.js
import express from "express";
import userAuth from "../middlewares/auth.js";
import authorizeRoles from "../middlewares/role.js";
import { getFacultyDashboard } from "../controllers/facultyController.js";

const facultyRouter = express.Router();

facultyRouter.get(
  "/api/faculty/dashboard",
  userAuth,
  authorizeRoles("Faculty"),
  getFacultyDashboard
);

export default facultyRouter;

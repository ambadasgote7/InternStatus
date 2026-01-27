// routes/faculty.js
import express from "express";
import userAuth from "../middlewares/auth.js";
import {authorizeRoles} from "../middlewares/role.js";
import { facultyRegister, getFacultyDashboard } from "../controllers/facultyController.js";
import { upload } from "../middlewares/upload.js";

const facultyRouter = express.Router();

facultyRouter.get(
  "/dashboard",
  userAuth,
  authorizeRoles("Faculty"),
  getFacultyDashboard
);

facultyRouter.post(
  "/register",
  userAuth,
  authorizeRoles("Faculty"),
  upload.single("verificationDocument"),
  facultyRegister
);

export default facultyRouter;

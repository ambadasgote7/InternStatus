// routes/company.js
import express from "express";
import userAuth from "../middlewares/auth.js";
import {authorizeRoles} from "../middlewares/role.js";
import { getCompanyDashboard, companyRegister, postInternships} from "../controllers/companyController.js";
import { upload } from "../middlewares/upload.js";

const companyRouter = express.Router();

companyRouter.get(
  "/dashboard",
  userAuth,
  authorizeRoles("Company"),
  getCompanyDashboard
);

companyRouter.post(
  "/register",
  userAuth,
  authorizeRoles("Company"),
  upload.single("verificationDocument"),
  companyRegister
);

companyRouter.post(
  "/internships",
  userAuth,
  authorizeRoles("Company"),
  postInternships
);

export default companyRouter;

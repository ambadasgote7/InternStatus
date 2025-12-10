// routes/company.js
import express from "express";
import userAuth from "../middlewares/auth.js";
import authorizeRoles from "../middlewares/role.js";
import { getCompanyDashboard } from "../controllers/companyController.js";

const companyRouter = express.Router();

companyRouter.get(
  "/api/company/dashboard",
  userAuth,
  authorizeRoles("Company"),
  getCompanyDashboard
);

export default companyRouter;

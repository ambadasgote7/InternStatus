
import express from "express";
import userAuth from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/role.js";
import { getInternshipApplicants, updateApplicationStatus } from "../controllers/applicationController.js";
const applicationRouter = express.Router();

applicationRouter.get(
  "/internship/:id/applicants",
  userAuth,
  authorizeRoles("Company"),
  getInternshipApplicants
);

applicationRouter.patch(
  "/:id/status",
  userAuth,
  authorizeRoles("Company"),
  updateApplicationStatus
);


export default applicationRouter;
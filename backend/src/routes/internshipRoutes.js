import express from "express";
import userAuth from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/role.js";
import { postInternship, applyInternship, getInternships, getCompanyInternships, updateInternshipStatus } from "../controllers/internshipController.js";
import { getInternshipApplicants, getStudentAppliedInternships } from "../controllers/applicationController.js";
const internshipRouter = express.Router();

internshipRouter.get(
  "/",
  userAuth,
  authorizeRoles("Student"),
  getInternships
);

internshipRouter.post(
  "/",
  userAuth,
  authorizeRoles("Company"),
  postInternship
);

internshipRouter.post(
  "/:internshipId/apply",
  userAuth,
  authorizeRoles("Student"),
  applyInternship
);

internshipRouter.get(
    "/student/applied",
    userAuth,
    authorizeRoles("Student"),
    getStudentAppliedInternships
);

internshipRouter.get(
  "/company/internships",
  userAuth,
  authorizeRoles("Company"),
  getCompanyInternships
);

internshipRouter.patch(
  "/company/internships/:id/status",
  userAuth,
  authorizeRoles("Company"),
  updateInternshipStatus
);

export default internshipRouter;

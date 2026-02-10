import express from "express";
import userAuth from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/role.js";
import { postInternship, applyInternship, getInternships } from "../controllers/internshipController.js";
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
  "/:internshipId/applicants",
  userAuth,
  authorizeRoles("Company"),
  getInternshipApplicants
);



export default internshipRouter;

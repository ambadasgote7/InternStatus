import express from "express";
import userAuth from "../middlewares/auth.js";
import { authorizeRoles } from "../middlewares/role.js";
import { postInternship, applyInternship, getInternships } from "../controllers/internshipController.js";
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
)

export default internshipRouter;

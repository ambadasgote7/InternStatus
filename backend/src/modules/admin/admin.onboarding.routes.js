import express from "express";
import * as controller from "./admin.onboarding.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";

const router = express.Router();

router.get(
  "/pending",
  authenticate,
  authorizeRoles("admin"),
  controller.getPending
);

router.get(
  "/verified",
  authenticate,
  authorizeRoles("admin"),
  controller.getVerified
);

router.get(
  "/:type/:id",
  authenticate,
  authorizeRoles("admin"),
  controller.getDetails
);

router.put(
  "/:type/:id/status",
  authenticate,
  authorizeRoles("admin"),
  controller.updateOnboardingStatus
);

export default router;
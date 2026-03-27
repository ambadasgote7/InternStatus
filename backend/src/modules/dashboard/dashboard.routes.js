import { Router } from "express";
import {  getDashboard } from "./dashboard.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { authorizeRoles } from "../../middleware/role.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getDashboard
);



export default router;
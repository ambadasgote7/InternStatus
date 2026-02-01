// routes/collegeRoutes.js
import express from "express";
import { addCollege, getAllColleges } from "../controllers/collegeController.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const collegeRouter = express.Router();

collegeRouter.post("/", requireAdmin, addCollege);   // Admin only
collegeRouter.get("/", getAllColleges);               // Public (for dropdown)

export default collegeRouter;

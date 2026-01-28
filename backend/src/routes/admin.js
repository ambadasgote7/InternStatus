import express from "express";
import { adminLogin } from "../controllers/adminController.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get('/check', requireAdmin, (req, res) => {
    res.status(200).json({ ok: true });
});

export default adminRouter;

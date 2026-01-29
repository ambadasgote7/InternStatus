import express from "express";
import { adminLogin, adminLogout, pendingFacultyRequests } from "../controllers/adminController.js";
import { requireAdmin } from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get('/check', requireAdmin, (req, res) => {
    res.status(200).json({ ok: true });
});
adminRouter.get('/pending-faculty-requests', requireAdmin, pendingFacultyRequests);
adminRouter.post('/logout', requireAdmin, adminLogout);

export default adminRouter;

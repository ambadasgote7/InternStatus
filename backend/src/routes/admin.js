import express from "express";
import { adminLogin, adminLogout, getAdminDashboard, getAllUsers, pendingCompanyRequests, pendingFacultyRequests, updateCompanyRequestStatus, updateFacultyRequestStatus, verifiedCompanyRequests, verifiedFacultyRequests } from "../controllers/adminController.js";
import { requireAdmin } from "../middlewares/adminAuth.js";
import authRouter from "./auth.js";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get('/check', requireAdmin, (req, res) => {
    res.status(200).json({ ok: true });
});
adminRouter.get(
    '/dashboard', 
    requireAdmin, 
    getAdminDashboard
);
adminRouter.get('/users', requireAdmin, getAllUsers);
adminRouter.get(
    '/pending-faculty-requests', 
    requireAdmin, 
    pendingFacultyRequests
);

adminRouter.post(
  "/faculty/:id/:status",
  requireAdmin,
  updateFacultyRequestStatus
);
adminRouter.get(
    '/verified-faculty-requests', 
    requireAdmin,
    verifiedFacultyRequests
);
adminRouter.get(
    '/pending-company-requests', 
    requireAdmin,
    pendingCompanyRequests
);
adminRouter.post(
    "/company/:id/:status",
    requireAdmin,
    updateCompanyRequestStatus
);
adminRouter.get(
    '/verified-company-requests', 
    requireAdmin,
    verifiedCompanyRequests
)
adminRouter.post(
    '/logout', 
    requireAdmin, 
    adminLogout
);

export default adminRouter;

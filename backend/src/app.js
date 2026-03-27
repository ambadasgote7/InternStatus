
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// ROUTE MODULES
import authRoutes from "./modules/auth/auth.routes.js";
import onboardingRoutes from "./modules/onboarding/onboarding.routes.js";
import collegeRoutes from "./modules/college/college.routes.js";
import companyRoutes from "./modules/company/company.routes.js";
import facultyRoutes from "./modules/faculty/faculty.routes.js";
import mentorRoutes from "./modules/mentor/mentor.routes.js";
import internshipRoutes from "./modules/internship/internship.routes.js";
import applicationRoutes from "./modules/application/application.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import adminOnBoardingRoutes from "./modules/admin/admin.onboarding.routes.js";
import adminOrganizationRoutes from "./modules/admin/admin.organization.routes.js";
import adminUsersRoutes from "./modules/admin/user/admin.users.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import taskSubmissionRoutes from "./modules/taskSubmissions/taskSubmission.routes.js";
import progressLogRoutes from "./modules/progressLogs/progressLog.routes.js";
import internshipReportRoutes from "./modules/internshipReports/internshipReport.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";


const app = express();

/* ---------------------------------------
   CORS
---------------------------------------- */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

/* ---------------------------------------
   MIDDLEWARE
---------------------------------------- */
app.use(express.json());
app.use(cookieParser());

/* ---------------------------------------
   HEALTH CHECK
---------------------------------------- */
app.get("/", (req, res) => {
  res.send("InternStatus API running");
});

/* ---------------------------------------
   API ROUTES
---------------------------------------- */

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin/onboarding", adminOnBoardingRoutes);
app.use("/api/admin", adminOrganizationRoutes);
app.use("/api/admin/users", adminUsersRoutes); 
app.use("/api/tasks", taskRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/task-submissions", taskSubmissionRoutes);
app.use("/api/progress", progressLogRoutes);
app.use("/api/reports", internshipReportRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* ---------------------------------------
   404 HANDLER
---------------------------------------- */

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

export default app;
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";
import studentRouter from "./routes/student.js";
import companyRouter from "./routes/company.js";
import facultyRouter from "./routes/faculty.js";
import adminRouter from "./routes/admin.js";
import collegeRouter from "./routes/college.js";
import internshipRouter from "./routes/internshipRoutes.js";

const app = express();

/* ✅ CORS middleware ALONE is enough */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

/* Parsers */
app.use(express.json());
app.use(cookieParser());

/* Routes */
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/student", studentRouter);
app.use("/api/company", companyRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/college", collegeRouter);
app.use("/api/internships", internshipRouter);

export default app;

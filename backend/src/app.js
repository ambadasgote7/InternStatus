// app.js
import express from "express";
const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.js";
import studentRouter from "./routes/student.js";
import companyRouter from "./routes/company.js";
import facultyRouter from "./routes/faculty.js";

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use("/", authRouter);

// Role-based routes
app.use("/", studentRouter);
app.use("/", companyRouter);
app.use("/", facultyRouter);

export default app;

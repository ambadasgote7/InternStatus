import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import your routers
import authRouter from "./routes/auth.js";
import studentRouter from "./routes/student.js";
import companyRouter from "./routes/company.js";
import facultyRouter from "./routes/faculty.js";
import adminRouter from "./routes/admin.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/test', (req, res) => {
  res.send('Hello World!');
});

// Use your routers
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/student", studentRouter);
app.use("/api/company", companyRouter);
app.use("/api/faculty", facultyRouter);

export default app;
import express from "express";
import { signup, login, logout } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup/student", signup("Student"));
authRouter.post("/signup/faculty", signup("Faculty"));
authRouter.post("/signup/company", signup("Company"));
authRouter.post("/login", login);
authRouter.post("/logout", logout);

export default authRouter; // Make sure this export is there
import express from "express";
import { signup, login, logout, setPassword, getMe } from "../controllers/authController.js";
import userAuth from "../middlewares/auth.js";
const authRouter = express.Router();

authRouter.post("/signup/student", signup("Student"));
authRouter.post("/signup/faculty", signup("Faculty"));
authRouter.post("/signup/company", signup("Company"));
authRouter.post("/login", login);
authRouter.post("/set-password", setPassword);
authRouter.post("/logout", logout);
authRouter.get('/me', userAuth, getMe);

export default authRouter; 
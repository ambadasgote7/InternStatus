
import express from "express";
import userAuth from "../middlewares/auth.js";
import { signup, login, logout } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/api/auth/signup", signup);
authRouter.post("/api/auth/login", login);
authRouter.post("/api/auth/logout", userAuth, logout);

export default authRouter;

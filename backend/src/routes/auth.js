
import express from "express";
import userAuth from "../middlewares/auth.js";
import { signup, login, logout, getMe } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", userAuth, logout);
authRouter.get("/me", userAuth, getMe);

export default authRouter;


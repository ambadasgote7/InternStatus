import nodemailer from "nodemailer";
import {
  loginService,
  setPasswordService,
  logoutService,
  getMeService,
  forgotPasswordService,
  resetPasswordService
} from "./auth.service.js";

import User from "../../models/User.js";

/* EMAIL TRANSPORTER */
console.log("🔥 AUTH CONTROLLER FILE LOADED");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const login = async (req, res) => {
  console.log("🔥 LOGIN API CALLED", new Date().toISOString());

  try {
    const result = await loginService(req.body);

    console.log("✅ RESPONSE SENT");

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      data: result.user,
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
    return res.status(400).json({ message: err.message });
  }
};

/* SET PASSWORD */
export const setPassword = async (req, res) => {
  try {

    const result = await setPasswordService(req.body);

    res.status(200).json({
      message: result.message
    });

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }
};


/* LOGOUT */
export const logout = async (req, res) => {
  try {

    await logoutService(res);

    res.status(200).json({
      message: "Logout successful"
    });

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }
};


/* GET CURRENT USER */
export const getMe = async (req, res) => {
  try {

    const user = await getMeService(req.user);

    res.status(200).json({
      message: "User fetched successfully",
      data: user
    });

  } catch (err) {

    res.status(401).json({
      message: err.message
    });

  }
};


export const sendResetOTP = async (req, res) => {

  try {

    const result = await forgotPasswordService(req.body);

    res.status(200).json(result);

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }

};

export const resetPassword = async (req, res) => {

  try {

    const result = await resetPasswordService(req.body);

    res.status(200).json(result);

  } catch (err) {

    res.status(400).json({
      message: err.message
    });

  }

};
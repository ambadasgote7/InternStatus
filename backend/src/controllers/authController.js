
import validateSignupData from "../utils/validation.js";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import validator from "validator";

export const signup = async (req, res) => {
  try {
    validateSignupData(req.body);

    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      role,
    });

    const savedUser = await user.save();

    const token = savedUser.getJWT();

    // Set httpOnly cookie (for backend auth)
    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      sameSite: "lax",
    });

    const userObj = savedUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      message: "User added successfully",
      data: userObj,    // includes role
      token,            // for frontend (Redux) if you want to store it
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!validator.isEmail(email)) {
      throw new Error("Enter valid email");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = user.getJWT();

    // Set httpOnly cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      sameSite: "lax",
    });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "Login successful",
      data: userObj,   // includes role
      token,           // for frontend (Redux)
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};


export const getMe = async (req, res) => {
  try {
    // userAuth middleware already attached the user document to req.user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "User fetched successfully",
      data: userObj,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};
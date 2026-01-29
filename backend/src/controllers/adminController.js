import jwt from "jsonwebtoken";
import FacultyRegister from "../models/facultyRegister.js";
import User from "../models/user.js";


export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
        email: email,          // ✅ identity
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }      // ✅ match cookie
    );

    res.cookie("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,           // true in production (HTTPS)
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Admin login successful",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Admin login failed",
    });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      sameSite: "lax",
    });
    return res.status(200).json({
      message: "Admin logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Admin logout failed",
    });
  }
};


export const pendingFacultyRequests = async (req, res) => {
  try {

    const pendingRequests = await FacultyRegister.find({ status : "pending"});
    return res.status(200).json({
      message: "Pending faculty requests",
      pendingRequests,
    });

  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
      error: err,
    });
  }
}

export const approveFacultyRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { id } = req.params;

    const request = await FacultyRegister.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request already ${request.status}`,
      });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ message: "Linked user not found" });
    }

    await User.findByIdAndUpdate(request.userId, {
      isVerified: true,
    });

    request.status = "approved";
    request.verifiedAt = new Date();
    request.verifiedBy = req.user._id;

    await request.save();

    return res.status(200).json({
      message: "Request approved successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};


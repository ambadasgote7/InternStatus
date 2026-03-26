import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // ✅ COOKIE FIRST
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // ✅ FALLBACK HEADER
    else if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    // ✅ VERIFY
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        message: "Account inactive",
      });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("AUTH ERROR:", err.message); // 🔥 IMPORTANT FOR DEBUG

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// 🔐 Authenticate User (JWT)
const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Please login to continue",
      });
    }

    const decodedObj = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedObj;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.roleStatus === "revoked") {
      return res.status(403).json({
        message: "Role access revoked",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authentication failed",
      error: err.message,
    });
  }
};

export default userAuth;

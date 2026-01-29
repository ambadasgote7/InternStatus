import jwt from "jsonwebtoken";

export const requireAdmin = (req, res, next) => {
  try {
    // ✅ SAME cookie name as login
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Admin authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Correct role check (case-safe)
    if (decoded.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Admin access only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired admin token" });
  }
};

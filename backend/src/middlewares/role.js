// 🔒 Authorize Based On Role
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied. You do not have permission.",
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        message: err.message || "Authorization error",
      });
    }
  };
};

// 🚫 Extra Safety Layer (optional but clean)
export const requireActiveRole = (req, res, next) => {
  if (req.user.roleStatus === "revoked") {
    return res.status(403).json({
      message: "Role access revoked",
    });
  }
  next();
};

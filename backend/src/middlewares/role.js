// middlewares/roleMiddleware.js

const authorizeRole = (...allowedRoles) => {
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

export default authorizeRole;

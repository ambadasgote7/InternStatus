// controllers/companyController.js

export const getCompanyDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Company dashboard data",
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified, // important for frontend later
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong while loading company dashboard",
    });
  }
};

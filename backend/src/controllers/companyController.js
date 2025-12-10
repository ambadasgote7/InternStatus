// controllers/companyController.js

export const getCompanyDashboard = async (req, res) => {
  return res.status(200).json({
    message: "Company dashboard data",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

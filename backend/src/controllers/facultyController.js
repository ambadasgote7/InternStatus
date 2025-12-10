// controllers/facultyController.js

export const getFacultyDashboard = async (req, res) => {
  return res.status(200).json({
    message: "Faculty dashboard data",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

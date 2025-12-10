// controllers/studentController.js

export const getStudentDashboard = async (req, res) => {
  return res.status(200).json({
    message: "Student dashboard data",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

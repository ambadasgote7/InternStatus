// controllers/facultyController.js

export const getFacultyDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Faculty dashboard data",
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified, // key for later verification logic
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong while loading faculty dashboard",
    });
  }
};

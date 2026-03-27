import { getDashboardService } from "./dashboard.service.js";

export const getDashboard = async (req, res) => {
  try {
    const user = req.user;

    const data = await getDashboardService(user);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to load dashboard",
    });
  }
};
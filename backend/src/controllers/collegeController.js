// controllers/collegeController.js
import College from "../models/college.js";

// ➕ Add College (Admin only)
export const addCollege = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "College name is required" });
    }

    const college = await College.create({ name });

    return res.status(201).json({
      message: "College added successfully",
      college,
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "College already exists" });
    }

    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

// 📄 Get all colleges (Students / Faculty)
export const getAllColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    console.log(colleges)
    return res.status(200).json(colleges);
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

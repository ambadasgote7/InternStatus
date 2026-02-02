// controllers/collegeController.js
import College from "../models/college.js";

// ➕ Add College (Admin only)
export const addCollege = async (req, res) => {
  try {
    const { name, location } = req.body;
    console.log(name, location);

    if (!name || !location) {
      return res.status(400).json({ message: "College name and location is required" });
    }

   const college = new College({
    name, 
    location
   });
   
   await college.save();
  
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
    return res.status(200).json({
      message : "Colleges retrieved successfully",
      colleges
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

// controllers/studentController.js
import StudentProfile from "../models/studentProfile.js";
import User from "../models/user.js";

// Existing: simple dashboard placeholder
export const getStudentDashboard = async (req, res) => {
  return res.status(200).json({
    message: "Student dashboard data",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
    },
  });
};

// NEW: Get logged-in student's profile
export const getMyStudentProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      return res.status(200).json({
        message: "No profile found for this student",
        data: null,
      });
    }

    return res.status(200).json({
      message: "Student profile fetched successfully",
      data: profile,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong while fetching profile",
    });
  }
};

// NEW: Create or update logged-in student's profile
export const submitStudentProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fullName,
      phone,
      collegeName,
      course,
      year,
      skills,
      resumeUrl,
      bio,
    } = req.body;

    // Basic validation – keep it simple for now
    if (!fullName || !phone || !collegeName || !course || !year) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // Ensure user is actually a Student (extra safety)
    if (req.user.role !== "Student") {
      return res
        .status(403)
        .json({ message: "Only students can submit a student profile" });
    }

    // Upsert logic: if profile exists, update; otherwise create
    let profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      profile = new StudentProfile({
        userId,
        fullName,
        phone,
        collegeName,
        course,
        year,
        skills: Array.isArray(skills) ? skills : [],
        resumeUrl: resumeUrl || "",
        bio: bio || "",
        status: "pending", // submitting for verification
      });
    } else {
      profile.fullName = fullName;
      profile.phone = phone;
      profile.collegeName = collegeName;
      profile.course = course;
      profile.year = year;
      profile.skills = Array.isArray(skills) ? skills : [];
      profile.resumeUrl = resumeUrl || "";
      profile.bio = bio || "";
      profile.status = "pending"; // re-submitted for verification
      profile.rejectionReason = "";
      profile.verifiedBy = null;
      profile.verifiedAt = null;
    }

    const savedProfile = await profile.save();

    // Do NOT set user.isVerified here – only faculty/admin will do that on approval
    // Just ensure user exists
    await User.findByIdAndUpdate(userId, { $set: {} });

    return res.status(200).json({
      message: "Student profile submitted successfully and pending verification",
      data: savedProfile,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong while submitting profile",
    });
  }
};

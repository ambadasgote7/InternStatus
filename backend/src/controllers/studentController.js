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

// controllers/studentController.js
export const submitStudentProfile = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const {
      fullName,
      prn,
      collegeName,
      phone,
      course,
      year,
      bio,
    } = req.body;

    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];

    if (!fullName || !prn || !collegeName || !phone || !course || !year) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const collegeIdFile = req.files?.collegeIdFile?.[0];
    const resumeFile = req.files?.resumeFile?.[0];

    let profile = await StudentProfile.findOne({ userId: req.user._id });

    /* ================= FIRST TIME SUBMISSION ================= */
    if (!profile) {
      profile = new StudentProfile({
        userId: req.user._id,
        fullName,
        prn,
        collegeName,
        phone,
        course,
        year,
        bio: bio || "",
        skills,
        collegeIdImageUrl: collegeIdFile
          ? `/uploads/${collegeIdFile.originalname}`
          : "",
        resumeFileUrl: resumeFile
          ? `/uploads/${resumeFile.originalname}`
          : "",
        status: "pending",
      });

      req.user.isRegistered = true;   // 🔒 permanent
      req.user.isVerified = false;    // until faculty approves
      await req.user.save();
    } 
    /* ================= RE-SUBMISSION / UPDATE ================= */
    else {
      // 🔒 identity locked AFTER verification
      if (!req.user.isVerified) {
        profile.fullName = fullName;
        profile.prn = prn;
        profile.collegeName = collegeName;
      }

      profile.phone = phone;
      profile.course = course;
      profile.year = year;
      profile.skills = skills;
      profile.bio = bio || "";

      if (!req.user.isVerified && collegeIdFile) {
        profile.collegeIdImageUrl = `/uploads/${collegeIdFile.originalname}`;
      }

      if (resumeFile) {
        profile.resumeFileUrl = `/uploads/${resumeFile.originalname}`;
      }

      // 🔁 resubmission always goes back to pending
      if (!req.user.isVerified) {
        profile.status = "pending";
      }
    }

    await profile.save();

    return res.status(200).json({
      message: "Profile saved successfully",
      profile,
      user: {
        isRegistered: req.user.isRegistered,
        isVerified: req.user.isVerified,
      },
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

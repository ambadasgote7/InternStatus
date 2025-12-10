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
    const userId = req.user._id;

    const {
      fullName,
      phone,
      collegeName,
      collegeId,
      prn,
      course,
      year,
      skills,
      collegeIdImageUrl,
      resumeFileUrl,
      bio,
    } = req.body;

    // Basic required fields for identity verification
    if (
      !fullName ||
      !phone ||
      !collegeName ||
      !collegeId ||
      !prn ||
      !course ||
      !year
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    if (req.user.role !== "Student") {
      return res
        .status(403)
        .json({ message: "Only students can submit a student profile" });
    }

    let profile = await StudentProfile.findOne({ userId });

    if (!profile) {
      // First-time profile creation
      profile = new StudentProfile({
        userId,
        fullName,
        phone,
        collegeName,
        collegeId,
        prn,
        course,
        year,
        skills: Array.isArray(skills) ? skills : [],
        collegeIdImageUrl: collegeIdImageUrl || "",
        resumeFileUrl: resumeFileUrl || "",
        bio: bio || "",
        status: req.user.isVerified ? "verified" : "pending",
      });
    } else {
      if (!req.user.isVerified) {
        // NOT VERIFIED YET → faculty uses this for identity check
        profile.fullName = fullName;
        profile.phone = phone;
        profile.collegeName = collegeName;
        profile.collegeId = collegeId;
        profile.prn = prn;
        profile.course = course;
        profile.year = year;
        profile.skills = Array.isArray(skills) ? skills : [];
        profile.collegeIdImageUrl = collegeIdImageUrl || profile.collegeIdImageUrl;
        profile.resumeFileUrl = resumeFileUrl || profile.resumeFileUrl;
        profile.bio = bio || "";

        profile.status = "pending";
        profile.rejectionReason = "";
        profile.verifiedBy = null;
        profile.verifiedAt = null;
      } else {
        // ALREADY VERIFIED → free to update profile (no re-verification)
        profile.fullName = fullName || profile.fullName;
        profile.phone = phone || profile.phone;

        // Identity fields we keep stable by default
        // comment/uncomment if you want them editable
        // profile.collegeName = collegeName || profile.collegeName;
        // profile.collegeId = collegeId || profile.collegeId;
        // profile.prn = prn || profile.prn;
        // profile.course = course || profile.course;
        // profile.year = year || profile.year;

        if (Array.isArray(skills)) {
          profile.skills = skills;
        }

        if (typeof collegeIdImageUrl === "string" && collegeIdImageUrl) {
          profile.collegeIdImageUrl = collegeIdImageUrl;
        }

        if (typeof resumeFileUrl === "string" && resumeFileUrl) {
          profile.resumeFileUrl = resumeFileUrl;
        }

        if (typeof bio === "string") {
          profile.bio = bio;
        }

        // Do NOT touch status or user.isVerified here
      }
    }

    const savedProfile = await profile.save();

    return res.status(200).json({
      message: req.user.isVerified
        ? "Profile updated successfully"
        : "Profile submitted successfully and pending verification",
      data: savedProfile,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong while submitting profile",
    });
  }
};

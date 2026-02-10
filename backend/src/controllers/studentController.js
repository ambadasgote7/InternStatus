// controllers/studentController.js
import StudentProfile from "../models/studentProfile.js";
import User from "../models/user.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import College from "../models/college.js";

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


export const submitStudentProfile = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const {
      fullName,
      prn,
      college,          // 🔥 ObjectId, not name
      phone,
      course,
      year,
      bio,
    } = req.body;

    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];

    /* --------------------------------------------------
       1️⃣ Basic validation
    -------------------------------------------------- */
    if (!fullName || !prn || !college || !phone || !course || !year) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    /* --------------------------------------------------
       2️⃣ Validate college exists
    -------------------------------------------------- */
    const collegeExists = await College.findById(college);
    if (!collegeExists) {
      return res.status(400).json({
        message: "Invalid college selected",
      });
    }

    const collegeIdFile = req.files?.collegeIdFile?.[0];
    const resumeFile = req.files?.resumeFile?.[0];

    let profile = await StudentProfile.findOne({ userId: req.user._id });

    /* ================= FIRST SUBMISSION ================= */
    if (!profile) {
      if (!collegeIdFile) {
        return res.status(400).json({
          message: "College ID is required",
        });
      }

      const collegeIdUpload = await uploadToCloudinary(
        collegeIdFile,
        "student/college-id"
      );

      let resumeUpload = null;
      if (resumeFile) {
        resumeUpload = await uploadToCloudinary(
          resumeFile,
          "student/resume"
        );
      }

      profile = new StudentProfile({
        userId: req.user._id,
        fullName,
        prn,
        college,                 // ✅ ObjectId reference
        phone,
        course,
        year,
        bio: bio || "",
        skills,

        collegeIdImageUrl: collegeIdUpload.secure_url,
        collegeIdImagePublicId: collegeIdUpload.public_id,

        resumeFileUrl: resumeUpload?.secure_url || "",
        resumeFilePublicId: resumeUpload?.public_id || "",

        status: "pending",
      });

      req.user.isRegistered = true;
      req.user.isVerified = false;
      await req.user.save();
    }

    /* ================= UPDATE ================= */
    else {
      if (!req.user.isVerified) {
        profile.fullName = fullName;
        profile.prn = prn;
        profile.college = college;     // 🔥 still ObjectId
        profile.status = "pending";
      }

      profile.phone = phone;
      profile.course = course;
      profile.year = year;
      profile.skills = skills;
      profile.bio = bio || "";

      if (!req.user.isVerified && collegeIdFile) {
        const collegeIdUpload = await uploadToCloudinary(
          collegeIdFile,
          "student/college-id"
        );

        profile.collegeIdImageUrl = collegeIdUpload.secure_url;
        profile.collegeIdImagePublicId = collegeIdUpload.public_id;
      }

      if (resumeFile) {
        const resumeUpload = await uploadToCloudinary(
          resumeFile,
          "student/resume"
        );

        profile.resumeFileUrl = resumeUpload.secure_url;
        profile.resumeFilePublicId = resumeUpload.public_id;
      }
    }

    await profile.save();

    return res.status(200).json({
      message: "Profile saved successfully",
      profile,
      flags: {
        isRegistered: req.user.isRegistered,
        isVerified: req.user.isVerified,
      }
    });

  } catch (err) {
    console.error("Profile submission error:", err);
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};



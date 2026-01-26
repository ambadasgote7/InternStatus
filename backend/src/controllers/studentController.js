// controllers/studentController.js
import StudentProfile from "../models/studentProfile.js";
import User from "../models/user.js";
import { uploadToCloudinary } from "../services/cloudinary.js";

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
      collegeName,
      phone,
      course,
      year,
      bio,
    } = req.body;

    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];

    if (!fullName || !prn || !collegeName || !phone || !course || !year) {
      return res.status(400).json({
        message: "All required fields must be filled",
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

      console.log("Uploading college ID file:", collegeIdFile.originalname);
      const collegeIdUpload = await uploadToCloudinary(
        collegeIdFile,
        "student/college-id"
      );

      let resumeUpload = null;
      if (resumeFile) {
        console.log("Uploading resume file:", resumeFile.originalname);
        resumeUpload = await uploadToCloudinary(
          resumeFile,
          "student/resume"
        );
      }

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
        profile.collegeName = collegeName;
        profile.status = "pending";
      }

      profile.phone = phone;
      profile.course = course;
      profile.year = year;
      profile.skills = skills;
      profile.bio = bio || "";

      if (!req.user.isVerified && collegeIdFile) {
        console.log("Updating college ID file:", collegeIdFile.originalname);
        const collegeIdUpload = await uploadToCloudinary(
          collegeIdFile,
          "student/college-id"
        );

        profile.collegeIdImageUrl = collegeIdUpload.secure_url;
        profile.collegeIdImagePublicId = collegeIdUpload.public_id;
      }

      if (resumeFile) {
        console.log("Updating resume file:", resumeFile.originalname);
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
      profile: {
        ...profile._doc,
        // Add direct download URLs for files
        collegeIdDownloadUrl: profile.collegeIdImageUrl,
        resumeDownloadUrl: profile.resumeFileUrl,
      },
      user: {
        isRegistered: req.user.isRegistered,
        isVerified: req.user.isVerified,
      },
    });
  } catch (err) {
    console.error("Profile submission error:", err);
    return res.status(500).json({ 
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

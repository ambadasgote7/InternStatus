// controllers/facultyController.js

import FacultyRegister from "../models/facultyRegister.js";
import validator from "validator";
import User from "../models/user.js";
import { uploadToCloudinary } from "../services/cloudinary.js";
import StudentProfile from "../models/studentProfile.js";
import College from "../models/college.js";

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

export const facultyRegister = async (req, res) => {
  try {
    const {
      requesterName,
      college,               // 🔥 ObjectId from frontend
      collegeWebsite,
      requestedFaculties,
    } = req.body;

    const requesterEmail = req.user.email;
    const userId = req.user._id;

    /* --------------------------------------------------
       1️⃣ Basic validation
    -------------------------------------------------- */
    if (!requesterName || !college) {
      return res.status(400).json({
        message: "Requester name and college are required",
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

    /* --------------------------------------------------
       3️⃣ Prevent duplicate request by same user
    -------------------------------------------------- */
    const existingRequestByUser = await FacultyRegister.findOne({
      userId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingRequestByUser) {
      return res.status(400).json({
        message: "You have already submitted a registration request",
      });
    }

    /* --------------------------------------------------
       4️⃣ File validation
    -------------------------------------------------- */
    if (!req.file) {
      return res.status(400).json({
        message: "Verification document required",
      });
    }

    /* --------------------------------------------------
       5️⃣ Parse requestedFaculties
    -------------------------------------------------- */
    let parsedFaculties = [];
    try {
      parsedFaculties = JSON.parse(requestedFaculties || "[]");
    } catch {
      return res.status(400).json({
        message: "Invalid requestedFaculties format",
      });
    }

    if (!Array.isArray(parsedFaculties)) {
      return res.status(400).json({
        message: "Requested faculties must be an array",
      });
    }

    /* --------------------------------------------------
       6️⃣ Validate faculty emails
    -------------------------------------------------- */
    const emailSet = new Set();

    for (const faculty of parsedFaculties) {
      if (!faculty.facultyName || !faculty.facultyEmail) {
        return res.status(400).json({
          message: "Faculty name and email are required",
        });
      }

      const facultyEmail = faculty.facultyEmail.toLowerCase().trim();

      if (!validator.isEmail(facultyEmail)) {
        return res.status(400).json({
          message: `Invalid faculty email: ${facultyEmail}`,
        });
      }

      if (emailSet.has(facultyEmail)) {
        return res.status(400).json({
          message: `Duplicate faculty email found: ${facultyEmail}`,
        });
      }

      emailSet.add(facultyEmail);
      faculty.facultyEmail = facultyEmail;
    }

    /* --------------------------------------------------
       7️⃣ Upload verification document
    -------------------------------------------------- */
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(
        req.file,
        "faculty-verification"
      );
    } catch {
      return res.status(500).json({
        message: "Verification document upload failed",
      });
    }

    /* --------------------------------------------------
       8️⃣ Save FacultyRegister
    -------------------------------------------------- */
    const facultyRegister = new FacultyRegister({
      userId,
      requesterName,
      requesterEmail,
      college, // ✅ ObjectId reference
      collegeWebsite,
      verificationDocumentUrl: uploadResult.secure_url,
      requestedFaculties: parsedFaculties,
      status: "pending",
    });

    await facultyRegister.save();

    /* --------------------------------------------------
       9️⃣ Mark user as registered
    -------------------------------------------------- */
    await User.findByIdAndUpdate(userId, {
      isRegistered: true,
    });

    return res.status(201).json({
      message: "Faculty registration submitted successfully",
      data: facultyRegister,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const getPendingStudentRequests = async (req, res) => {
  try {
    const pendingRequests = await StudentProfile.find({ status: "pending" });
    const yourCollegeStudents = pendingRequests.filter((students) => (
       FacultyRegister.collegeName.equals(StudentProfile.collegeName)
    ))

    res.status(200).json({
      message : "Studnet Profiles Fetched",
      yourCollegeStudents
    })

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
}

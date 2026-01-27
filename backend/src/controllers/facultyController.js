// controllers/facultyController.js

import FacultyRegister from "../models/facultyRegister.js";
import validator from "validator";
import User from "../models/user.js";
import { uploadToCloudinary } from "../services/cloudinary.js";

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
      collegeName,
      collegeWebsite,
      requestedFaculties,
    } = req.body;

    const requesterEmail = req.user.email;
    const userId = req.user._id;



    /* --------------------------------------------------
       1️⃣ Basic validation
    -------------------------------------------------- */
    if (!requesterName || !collegeName) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    /* --------------------------------------------------
       2️⃣ Prevent duplicate request by same user
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
       3️⃣ File validation
    -------------------------------------------------- */
    if (!req.file) {
      return res.status(400).json({
        message: "Verification document required",
      });
    }

    /* --------------------------------------------------
       4️⃣ Parse requestedFaculties
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
       5️⃣ Validate faculty emails
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
       6️⃣ Upload verification document to Cloudinary
    -------------------------------------------------- */
    let uploadResult;
    try {
      uploadResult = await uploadToCloudinary(
        req.file,
        "faculty-verification"
      );
    } catch (err) {
      return res.status(500).json({
        message: "Verification document upload failed",
      });
    }

    /* --------------------------------------------------
       7️⃣ Save FacultyRegister
    -------------------------------------------------- */
    const facultyRegister = new FacultyRegister({
      userId, // 🔥 THIS FIXES YOUR DUPLICATE KEY ERROR
      requesterName,
      requesterEmail,
      collegeName,
      collegeWebsite,
      verificationDocumentUrl: uploadResult.secure_url,
      requestedFaculties: parsedFaculties,
      status: "pending",
    });

    await facultyRegister.save();

    /* --------------------------------------------------
       8️⃣ Mark user as registered
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


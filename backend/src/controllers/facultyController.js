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
    // safety check
    if (!req.user.college) {
      return res.status(400).json({
        message: "Faculty college not assigned",
      });
    }

    const pendingRequests = await StudentProfile.find({
      status: "pending",
      college: req.user.college,
    }).populate("college", "name"); 

    return res.status(200).json({
      message: "Student profiles fetched",
      pendingRequests,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const updateStudentRequestStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await StudentProfile.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request already ${request.status}`,
      });
    }

    if (!req.user.college) {
      return res.status(403).json({
        message: "Faculty college not assigned",
      });
    }

    if (request.college.toString() !== req.user.college.toString()) {
      return res.status(403).json({
        message: "You are not authorized to review this student",
      });
    }

    const studentUser = await User.findById(request.userId);
    if (!studentUser) {
      return res.status(404).json({ message: "Linked user not found" });
    }

    // 🔥 SYNC COLLEGE INTO USER
    studentUser.college = request.college;
    studentUser.isVerified = status === "approved";

    await studentUser.save();

    request.status = status;
    request.verifiedAt = new Date();
    request.verifiedBy = req.user._id;

    await request.save();

    return res.status(200).json({
      message: `Request ${status} successfully`,
    });
  } catch (err) {
    console.error("Student request update error:", err);
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const getVerifiedStudentRequests = async (req, res) => {
  try {
    // 1️⃣ Enforce faculty-only access
    if (req.user.role !== "Faculty") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 2️⃣ Ensure faculty is mapped to a college
    if (!req.user.college) {
      return res.status(400).json({ message: "Faculty college not assigned" });
    }

    // 3️⃣ Fetch only approved students of faculty’s college
    const verifiedRequests = await StudentProfile.find({
      status: "approved",
      college: req.user.college,
    })
      .populate("college", "name")
      .sort({ verifiedAt: -1 });

    return res.status(200).json({ verifiedRequests });

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};


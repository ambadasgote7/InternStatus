// controllers/companyController.js

import CompanyRegister from "../models/companyRegister.js";
import Internship from "../models/internships.js";
import User from "../models/user.js";
import { uploadToCloudinary } from "../services/cloudinary.js";

export const getCompanyDashboard = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Company dashboard data",
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified, // important for frontend later
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong while loading company dashboard",
    });
  }
};

export const companyRegister = async (req, res) => {
  try {
    const { requesterName, companyName, companyWebsite } = req.body;

    const userId = req.user._id;
    const requesterEmail = req.user.email;

    if (!companyName || !requesterName) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const existingRequestByUser = await CompanyRegister.findOne({
      userId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingRequestByUser) {
      return res.status(400).json({
        message: "You have already submitted a registration request",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Verification document required",
      });
    }

    const uploadResult = await uploadToCloudinary(
      req.file,
      "company-verification"
    );

    const companyRegister = new CompanyRegister({
      userId,
      requesterName,
      requesterEmail,
      companyName,
      companyWebsite,
      verificationDocumentUrl: uploadResult.secure_url,
      status: "pending",
    });

    await User.findByIdAndUpdate(userId, {
      isRegistered: true,
    });

    await companyRegister.save();

    return res.status(201).json({
      message: "Company registration submitted successfully",
      data: companyRegister,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Company registration failed",
    });
  }
};

export const postInternships = async (req, res) => {
  try {
    if (req.user.role !== "Company") {
      return res.status(403).json({
        message: "Only companies can post internships",
      });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      applicationDeadline,
      mode,
      skillsRequired,
      maxApplicants,
    } = req.body;

    // 1. Required fields
    if (!title || !description || !startDate || !endDate || !applicationDeadline || !mode) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 2. Type checks
    if (!Array.isArray(skillsRequired) || skillsRequired.length === 0) {
      return res.status(400).json({ message: "skillsRequired must be a non-empty array" });
    }

    if (typeof maxApplicants !== "number") {
      return res.status(400).json({ message: "maxApplicants must be a number" });
    }

    // 3. Date logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(applicationDeadline);
    const now = new Date();

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    if (deadline < now) {
      return res.status(400).json({
        message: "Application deadline cannot be in the past",
      });
    }

    if (deadline >= start) {
      return res.status(400).json({
        message: "Application deadline must be before start date",
      });
    }

    if (maxApplicants < 1) {
      return res.status(400).json({
        message: "Max applicants must be at least 1",
      });
    }

    const internship = await Internship.create({
      title: title.trim(),
      description,
      company: req.user._id,
      startDate: start,
      endDate: end,
      applicationDeadline: deadline,
      mode,
      skillsRequired,
      maxApplicants,
      status: "open",
    });

    return res.status(201).json({
      message: "Internship posted successfully",
      data: internship,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Internship submission failed",
    });
  }
};


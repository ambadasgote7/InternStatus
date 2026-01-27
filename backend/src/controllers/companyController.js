// controllers/companyController.js

import CompanyRegister from "../models/companyRegister.js";
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



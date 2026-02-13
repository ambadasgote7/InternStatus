import mongoose from "mongoose";
import Internship from "../models/internship.js";
import Application from "../models/application.js";
import StudentProfile from "../models/studentProfile.js";
import CompanyRegister from "../models/companyRegister.js";

export const getInternships = async (req, res) => {
  try {
    let { page = 1, limit = 10, mode, search, skill } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const query = {
      status: "open",
      applicationDeadline: { $gte: new Date() },
    };

    // Mode filter
    if (mode && ["remote", "onsite", "hybrid"].includes(mode)) {
      query.mode = mode;
    }

    // Title search
    if (search && search.trim() !== "") {
      query.title = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // Skill filter
    if (skill && skill.trim() !== "") {
      query.skillsRequired = {
        $regex: skill.trim(),
        $options: "i",
      };
    }

    const [internships, total] = await Promise.all([
      Internship.find(query)
        .populate({
          path: "company",
          select: "companyName companyWebsite status",
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Internship.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Internships fetched successfully",
      total,
      page,
      pages: Math.ceil(total / limit),
      data: internships,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const postInternship = async (req, res) => {
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
      positions,
      stipendType,
      stipendAmount,
    } = req.body;

    // Basic Required Validation
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !applicationDeadline ||
      !mode ||
      !positions ||
      !maxApplicants ||
      !stipendType
    ) {
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    // Mode validation
    if (!["remote", "onsite", "hybrid"].includes(mode)) {
      return res.status(400).json({
        message: "Invalid mode selected",
      });
    }

    // Stipend validation
    if (!["paid", "unpaid", "not_disclosed"].includes(stipendType)) {
      return res.status(400).json({
        message: "Invalid stipend type",
      });
    }

    if (stipendType === "paid") {
      if (!stipendAmount || stipendAmount < 0) {
        return res.status(400).json({
          message: "Stipend amount must be provided for paid internships",
        });
      }
    }

    // Skills validation
    if (!Array.isArray(skillsRequired) || skillsRequired.length === 0) {
      return res.status(400).json({
        message: "At least one skill is required",
      });
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(applicationDeadline);
    const now = new Date();

    if (end <= start) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    if (deadline >= start) {
      return res.status(400).json({
        message: "Application deadline must be before start date",
      });
    }

    if (deadline < now) {
      return res.status(400).json({
        message: "Application deadline cannot be in the past",
      });
    }

    if (positions < 1 || maxApplicants < 1) {
      return res.status(400).json({
        message: "Positions and maxApplicants must be at least 1",
      });
    }

    const companyProfile = await CompanyRegister.findOne({
      userId: req.user._id,
      status: "approved",
    });

    if (!companyProfile) {
      return res.status(403).json({
        message: "Company profile not found or not approved",
      });
    }


    const internship = await Internship.create({
      title: title.trim(),
      description: description.trim(),
      company: companyProfile._id,
      startDate: start,
      endDate: end,
      applicationDeadline: deadline,
      mode,
      skillsRequired,
      maxApplicants: Number(maxApplicants),
      positions: Number(positions),
      stipendType,
      stipendAmount:
        stipendType === "paid" ? Number(stipendAmount) : null,
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

export const applyInternship = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Role Check
    if (req.user.role !== "Student") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "Only students can apply for internships",
      });
    }

    const { internshipId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Invalid internship ID",
      });
    }

    // 2️⃣ Fetch Student Profile
    const studentProfile = await StudentProfile.findOne({
      userId: req.user._id,
      status: "approved",
    }).session(session);

    if (!studentProfile) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "Profile must be approved before applying",
      });
    }

    // 3️⃣ Fetch Internship (Atomic Lock)
    const internship = await Internship.findOne({
      _id: internshipId,
      status: "open",
      applicationDeadline: { $gte: new Date() },
    }).session(session);

    if (!internship) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        message: "Internship not available for application",
      });
    }

    // 4️⃣ Check Max Applicants Atomically
    const activeApplications = await Application.countDocuments({
      internship: internshipId,
      status: { $in: ["applied", "accepted"] },
    }).session(session);

    if (
      internship.maxApplicants &&
      activeApplications >= internship.maxApplicants
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Maximum applicants reached",
      });
    }

    // 5️⃣ Prevent Duplicate Application
    const existingApplication = await Application.findOne({
      internship: internshipId,
      student: studentProfile._id,
    }).session(session);

    if (existingApplication) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "You have already applied for this internship",
      });
    }

    // 6️⃣ Create Application
    const application = await Application.create(
      [
        {
          internship: internshipId,
          student: studentProfile._id,
          status: "applied",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Application submitted successfully",
      data: application[0],
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: "Application failed",
      error: err.message,
    });
  }
};

export const getCompanyInternships = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);

    // 🔥 Get company profile first
    const companyProfile = await CompanyRegister.findOne({
      userId: req.user._id,
      status: "approved",
    });

    if (!companyProfile) {
      return res.status(403).json({
        message: "Company profile not found or not approved",
      });
    }

    const query = {
      company: companyProfile._id,  // ✅ FIXED
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const [internships, total] = await Promise.all([
      Internship.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),

      Internship.countDocuments(query),
    ]);

    return res.status(200).json({
      message: "Internships fetched successfully",
      meta: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: internships,
    });

  } catch (err) {
    console.error("Get company internships error:", err);
    return res.status(500).json({
      message: "Failed to fetch internships",
    });
  }
};


export const updateInternshipStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["draft", "open", "closed", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const internship = await Internship.findOne({
      _id: req.params.id,
      company: req.user._id,
    });

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found or unauthorized",
      });
    }

    const currentStatus = internship.status;

    const validTransitions = {
      draft: ["open"],
      open: ["closed"],
      closed: ["completed"],
      completed: [],
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    // Business Rule:
    // Cannot open if deadline already passed
    if (status === "open" && internship.applicationDeadline < new Date()) {
      return res.status(400).json({
        message: "Cannot open internship after application deadline",
      });
    }

    internship.status = status;

    await internship.save();

    return res.status(200).json({
      message: "Internship status updated successfully",
      data: internship,
    });

  } catch (err) {
    console.error("Update internship status error:", err);
    return res.status(500).json({
      message: "Failed to update internship status",
    });
  }
};


import mongoose from "mongoose";
import Internship from "../models/internship.js";
import Application from "../models/application.js";
import StudentProfile from "../models/studentProfile.js";

export const getInternships = async (req, res) => {
  try {
    const { page = 1, limit = 10, mode, search, skill } = req.query;

    const query = {
      status: "open",
      applicationDeadline: { $gte: new Date() },
    };

    // Filter by mode (remote / onsite / hybrid)
    if (mode) {
      query.mode = mode;
    }

    // Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Filter by skill
    if (skill) {
      query.skillsRequired = { $in: [skill] };
    }

    const internships = await Internship.find(query)
      .populate("company", "email") // show company email only
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Internship.countDocuments(query);

    return res.status(200).json({
      message: "Internships fetched successfully",
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: internships,
    });

  } catch (err) {
    return res.status(400).json({
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

    const internship = await Internships.create({
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

export const applyInternship = async (req, res) => {
    

  console.log(await mongoose.connection.db.admin().command({ replSetGetStatus: 1 }));
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

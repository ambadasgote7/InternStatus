import Internship from "../models/internship.js";
import Application from "../models/application.js";
import StudentProfile from "../models/studentProfile.js";
import CompanyRegister from "../models/companyRegister.js";
import mongoose from "mongoose";
import { sendEmail } from "../utils/sendEmail.js";

export const getInternshipApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    // 1️⃣ Validate internship ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid internship ID",
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);

    // 2️⃣ Get company profile using logged-in user
    const companyProfile = await CompanyRegister.findOne({
      userId: req.user._id,
      status: "approved",
    });

    if (!companyProfile) {
      return res.status(403).json({
        message: "Company profile not found or not approved",
      });
    }

    // 3️⃣ Ownership check (IMPORTANT FIX)
    const internship = await Internship.findOne({
      _id: id,
      company: companyProfile._id,
    }).select("_id title status positions");

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found or unauthorized",
      });
    }

    // 4️⃣ Build query for applications
    const query = { internship: id };

    if (status) {
      query.status = status;
    }

    // 5️⃣ Fetch applications + count in parallel
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: "student",
          populate: {
            path: "userId",
            select: "email fullName",
          },
          select: "course year skills resumeFileUrl userId",
        })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),

      Application.countDocuments(query),
    ]);

    // 6️⃣ Optional name search
    let filteredApplications = applications;

    if (search) {
      const lowerSearch = search.toLowerCase();

      filteredApplications = applications.filter((app) =>
        app.student?.userId?.fullName
          ?.toLowerCase()
          .includes(lowerSearch)
      );
    }

    // 7️⃣ Return clean structured response
    return res.status(200).json({
      message: "Applicants fetched successfully",
      internship: {
        id: internship._id,
        title: internship.title,
        status: internship.status,
        positions: internship.positions,
      },
      meta: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
      data: filteredApplications,
    });

  } catch (err) {
    console.error("Get applicants error:", err);
    return res.status(500).json({
      message: "Failed to fetch applicants",
    });
  }
};

export const getStudentAppliedInternships = async (req, res) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(403).json({
        message: "Only students can access this resource",
      });
    }

    const studentProfile = await StudentProfile.findOne({
      userId: req.user._id,
      status: "approved",
    });

    if (!studentProfile) {
      return res.status(400).json({
        message: "Student profile not found",
      });
    }

    const applications = await Application.find({
      student: studentProfile._id,
      status: { $in: ["applied",
          "shortlisted",
          "interview",
          "accepted",
          "rejected",] },
    }).select("internship");

    const appliedInternshipIds = applications.map(app =>
      app.internship.toString()
    );

    return res.status(200).json({
      message: "Applied internships fetched",
      data: appliedInternshipIds,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    const allowedStatuses = [
      "shortlisted",
      "interview",
      "accepted",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const application = await Application.findById(id)
      .populate("internship")
      .populate({
        path: "student",
        populate: {
          path: "userId",
          select: "email fullName",
        },
      });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const internship = application.internship;

    const companyProfile = await CompanyRegister.findOne({
      userId: req.user._id,
    });

    if (
      !companyProfile ||
      internship.company.toString() !== companyProfile._id.toString()
    ) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (internship.status !== "open") {
      return res.status(400).json({
        message: "Internship is not open",
      });
    }

    const validTransitions = {
      applied: ["shortlisted", "rejected"],
      shortlisted: ["interview", "rejected"],
      interview: ["accepted", "rejected"],
      accepted: [],
      rejected: [],
    };

    if (!validTransitions[application.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${application.status} to ${status}`,
      });
    }

    // Position limit
    if (status === "accepted" && internship.positions) {
      const acceptedCount = await Application.countDocuments({
        internship: internship._id,
        status: "accepted",
      });

      if (acceptedCount >= internship.positions) {
        return res.status(400).json({
          message: "All positions already filled",
        });
      }
    }

    // Safe statusHistory push
    if (!application.statusHistory) {
      application.statusHistory = [];
    }

    application.status = status;

    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      changedAt: new Date(),
    });

    await application.save();

    // Send email (safe)
    const studentUser = application.student?.userId;

    if (studentUser?.email) {
      sendEmail({
        to: studentUser.email,
        subject: "Application Status Update",
        html: `
          <p>Hello ${studentUser.fullName || "Student"},</p>
          <p>Your application status is now <b>${status}</b>.</p>
        `,
      }).catch((err) =>
        console.error("Email failed:", err.message)
      );
    }

    return res.status(200).json({
      message: "Application status updated successfully",
      data: application,
    });

  } catch (err) {
    console.error("🔥 REAL ERROR:", err);
    return res.status(500).json({
      message: "Failed to update application status",
    });
  }
};


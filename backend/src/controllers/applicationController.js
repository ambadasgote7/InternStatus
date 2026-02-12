import Internship from "../models/internship.js";
import Application from "../models/application.js";
import StudentProfile from "../models/studentProfile.js";
import CompanyRegister from "../models/companyRegister.js";
import User from "../models/user.js";
import mongoose from "mongoose";

export const getInternshipApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    // 1️⃣ Validate internship id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid internship ID",
      });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);

    // 2️⃣ Ownership check
    const internship = await Internship.findOne({
      _id: id,
      company: req.user._id,
    }).select("_id title status positions");

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found or unauthorized",
      });
    }

    // 3️⃣ Build base query
    const query = {
      internship: id,
    };

    if (status) {
      query.status = status;
    }

    // 4️⃣ Execute DB queries in parallel
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: "student",
          select: "fullName course year skills resumeFileUrl email",
        })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),

      Application.countDocuments(query),
    ]);

    // 5️⃣ Search by student name (optional)
    let filteredApplications = applications;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredApplications = applications.filter((app) =>
        app.student?.fullName?.toLowerCase().includes(lowerSearch)
      );
    }

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
      status: { $in: ["applied", "accepted"] },
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
    console.log("Update application status:", status);

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid application ID",
      });
    }

    // 🔥 Nested populate to get student user
    const application = await Application.findById(id)
      .populate("internship")
      .populate({
        path: "student",
        populate: {
          path: "userId",
          model: "User",
          select: "email fullName",
        },
      });

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const internship = application.internship;

    // 🔥 Correct ownership check
    const companyProfile = await CompanyRegister.findOne({
      userId: req.user._id,
    });

    if (!companyProfile) {
      return res.status(403).json({
        message: "Company profile not found",
      });
    }

    if (internship.company.toString() !== companyProfile._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (internship.status !== "open") {
      return res.status(400).json({
        message: "Internship is not open",
      });
    }

    if (application.status === status) {
      return res.status(400).json({
        message: "Application already in this status",
      });
    }

    // 🔥 Strict transitions
    const validTransitions = {
      applied: ["shortlisted", "rejected"],
      shortlisted: ["interview", "rejected"],
      interview: ["accepted", "rejected"],
      accepted: [],
      rejected: [],
    };

    if (!validTransitions[application.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${application.status} to ${status}`,
      });
    }

    // Position limit check
    if (status === "accepted") {
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

    // Update
    application.status = status;

    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id, // User reference
    });

    await application.save();

    // Auto complete internship
    if (status === "accepted") {
      const acceptedAfter = await Application.countDocuments({
        internship: internship._id,
        status: "accepted",
      });

      if (acceptedAfter >= internship.positions) {
        internship.status = "completed";
        await internship.save();
      }
    }

    // 🔥 Send email using User.email
    const studentUser = application.student?.userId;

    if (studentUser?.email) {
      sendEmail({
        to: studentUser.email,
        subject: "Application Status Update",
        html: `
          <p>Hello ${studentUser.fullName || "Student"},</p>
          <p>Your application status has been updated to <b>${status}</b>.</p>
          <p>Regards,<br/>InternStatus Team</p>
        `,
      }).catch((err) => {
        console.error("Email failed:", err.message);
      });
    }

    return res.status(200).json({
      message: "Application status updated successfully",
      data: application,
    });

  } catch (err) {
    console.error("Update application status error:", err);
    return res.status(500).json({
      message: "Failed to update application status",
    });
  }
};


import Internship from "../models/internship.js";
import Application from "../models/application.js";
import StudentProfile from "../models/studentProfile.js";

export const getInternshipApplicants = async (req, res) => {
  try {
    if (req.user.role !== "Company") {
      return res.status(403).json({
        message: "Only companies can view applicants",
      });
    }

    console.log(req.user);

    const { internshipId } = req.params;

    const internship = await Internship.findOne({
      _id: internshipId,
      company: req.user._id, // adjust if using CompanyRegister ref
    });

    if (!internship) {
      return res.status(404).json({
        message: "Internship not found or unauthorized",
      });
    }

    const applications = await Application.find({
      internship: internshipId,
    })
      .populate({
        path: "student",
        select: "fullName course year skills resumeFileUrl",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Applicants fetched successfully",
      count: applications.length,
      data: applications,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
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



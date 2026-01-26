// controllers/facultyController.js

import FacultyRegister from "../models/facultyRegister.js";
import validator from "validator";
import User from "../models/user.js";

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
      requesterEmail, 
      collegeName, 
      collegeWebsite, 
      verificationDocumentUrl, 
      requestedFaculties = []
    } = req.body;

    if (!requesterName || !requesterEmail || !collegeName || !verificationDocumentUrl) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const normalizeRequesterEmail = requesterEmail.toLowerCase().trim();

    const existingCollege = await FacultyRegister.findOne({
      collegeName : collegeName.trim(),
      status : {$in : ["pending", "approved"]}
    })

    if (existingCollege) {
      return res.status(400).json({
        message: "College already registered",
        data: existingCollege
      });
    }

    if (!Array.isArray(requestedFaculties)) {
      return res.status(400).json({
        message: "Requested faculties must be an array",
      });
    }

    const emailSet = new Set();

    for (const faculty of requestedFaculties) {
      if (!faculty.facultyName || !faculty.facultyEmail) {
        return res.status(400).json({
          message: "Missing required fields",
        });
      }

      const facultyEmail = faculty.facultyEmail.toLowerCase().trim();

       if (!validator.isEmail(facultyEmail)) {
        return res.status(400).json({
          message: `Invalid faculty email: ${f.facultyEmail}`,
        });
      }

      if (emailSet.has(facultyEmail)) {
        return res.status(400).json({
          message : `Duplicate faculty email found : ${facultyEmail}`,
        });
      }

      emailSet.add(facultyEmail);

      faculty.facultyEmail = facultyEmail;
    }


    const facultyRegister = new FacultyRegister({
      requesterName, 
      requesterEmail, 
      collegeName, 
      collegeWebsite, 
      verificationDocumentUrl, 
      requestedFaculties, 
      status: "pending",
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: ""
    });

    await facultyRegister.save();

    await User.findByIdAndUpdate(
      req.user._id,
      { isRegistered: true },
      { new: true }
    );

    return res.status(201).json({
      message: "Faculty register submitted successfully",
      data: facultyRegister,
    });    

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong while loading faculty register",
    });
  }
}

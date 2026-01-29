import jwt from "jsonwebtoken";
import FacultyRegister from "../models/facultyRegister.js";
import User from "../models/user.js";
import CompanyRegister from "../models/companyRegister.js";
import { generatePasswordSetupToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";


export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 1️⃣ Find admin in DB
    const admin = await User.findOne({ email });
    console.log("Admin found?", admin);

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 2️⃣ Ensure role is Admin
    if (admin.role !== "Admin") {
      return res.status(403).json({
        message: "Not an admin account",
      });
    }
    // 3️⃣ Validate password
    const isPasswordValid = await admin.validatePassword(password);
console.log("Password valid?", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    console.log(email, password, admin.validatePassword(password));

    // 4️⃣ Generate JWT (same system as users)
    const token = admin.getJWT();

    // 5️⃣ Set cookie (reuse SAME cookie name)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Admin login successful",
      data: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      message: "Admin login failed",
    });
  }
};

export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      sameSite: "lax",
    });
    return res.status(200).json({
      message: "Admin logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Admin logout failed",
    });
  }
};

export const pendingFacultyRequests = async (req, res) => {
  try {

    const pendingRequests = await FacultyRegister.find({ status : "pending"});
    return res.status(200).json({
      message: "Pending faculty requests",
      pendingRequests,
    });

  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
      error: err,
    });
  }
}

export const updateFacultyRequestStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await FacultyRegister.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Request already ${request.status}` });
    }

    const requesterUser = await User.findById(request.userId);
    if (!requesterUser) {
      return res.status(404).json({ message: "Linked user not found" });
    }

    // APPROVAL FLOW
    if (status === "approved") {
      requesterUser.isVerified = true;
      await requesterUser.save();

      if (Array.isArray(request.requestedFaculties)) {
        for (const faculty of request.requestedFaculties) {
          let user = await User.findOne({ email: faculty.facultyEmail });

          if (!user) {
            const { rawToken, hashedToken } =
              generatePasswordSetupToken();

            user = await User.create({
              name: faculty.facultyName,
              email: faculty.facultyEmail,
              role: "Faculty",
              isVerified: true,
              isRegistered: true,
              passwordSetupToken: hashedToken,
              passwordSetupExpires: Date.now() + 1000 * 60 * 60 * 24, // 24h
            });

            const setupLink = `${process.env.FRONTEND_URL}/set-password?token=${rawToken}`

            // Email (best effort)
            try {
              await sendEmail({
                to: faculty.facultyEmail,
                subject: "Set Your Faculty Account Password",
                html: `
                  <p>Hello ${faculty.facultyName},</p>
                  <p>Your faculty account has been created.</p>
                  <p>Please set your password using the link below:</p>
                  <p>
                    <a href="${setupLink}">
                      Set Password
                    </a>
                  </p>
                  <p>This link will expire in 24 hours.</p>
                  <p>— InternStatus Team</p>
                `,
              });
            } catch (mailErr) {
              console.error("Email failed:", mailErr.message);
            }
          }

          faculty.status = "approved";
          faculty.verifiedAt = new Date();
        }
      }
    }

    // REJECTION
    if (status === "rejected") {
      request.rejectionReason = req.body?.reason || "";
    }

    request.status = status;
    request.verifiedBy = req.user._id;
    request.verifiedAt = new Date();

    await request.save();

    return res.status(200).json({
      message: `Request ${status} successfully`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};


export const verifiedFacultyRequests = async (req, res) => {
  try {
    const verifiedRequests = await FacultyRegister.find({
      status: "approved",
    })
      .populate("verifiedBy", "name email")
      .sort({ verifiedAt: -1 });

    return res.status(200).json({
      verifiedRequests,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const pendingCompanyRequests = async (req, res) => {
  try {

    const pendingRequests = await CompanyRegister.find({ status : "pending"});
    return res.status(200).json({
      message: "Pending faculty requests",
      pendingRequests,
    });

  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
      error: err,
    });
  }
}

export const updateCompanyRequestStatus = async (req, res) => {
  try {
    const { id, status } = req.params;

    // 1. Validate status strictly
    const allowedStatuses = ["approved", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 2. Find request
    const request = await CompanyRegister.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: `Request already ${request.status}`,
      });
    }

    // 3. Find linked user
    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ message: "Linked user not found" });
    }

    // 4. Update user verification
    const isVerified = status === "approved";

    await User.findByIdAndUpdate(request.userId, {
      isVerified,
    });

    // 5. Update faculty request
    request.status = status;
    request.verifiedAt = new Date();
    request.verifiedBy = req.user._id;

    await request.save();

    return res.status(200).json({
      message: `Request ${status} successfully`,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const verifiedCompanyRequests = async (req, res) => {
  try {
    const verifiedRequests = await CompanyRegister.find({
      status: "approved",
    })
      .populate("verifiedBy", "name email")
      .sort({ verifiedAt: -1 });

    return res.status(200).json({
      verifiedRequests,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
    });
  }
};
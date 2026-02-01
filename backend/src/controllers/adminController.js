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

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

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

export const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

    /* ================= USERS ================= */

    const totalUsers = await User.countDocuments();

    const usersByRole = {
      faculty: await User.countDocuments({ role: "Faculty" }),
      students: await User.countDocuments({ role: "Student" }),
      companies: await User.countDocuments({ role: "Company" }),
    };

    const unverifiedUsers = await User.countDocuments({
      isVerified: false,
    });

    const revokedUsers = await User.countDocuments({
      roleStatus: "revoked",
    });

    const newUsers = {
      last7Days: await User.countDocuments({
        createdAt: { $gte: last7Days },
      }),
      last30Days: await User.countDocuments({
        createdAt: { $gte: last30Days },
      }),
    };

    /* ================= FACULTY REQUESTS ================= */

    const facultyRequestStats = {
      pending: await FacultyRegister.countDocuments({ status: "pending" }),
      approved: await FacultyRegister.countDocuments({ status: "approved" }),
      rejected: await FacultyRegister.countDocuments({ status: "rejected" }),
    };

    const totalFacultyRequests =
      facultyRequestStats.pending +
      facultyRequestStats.approved +
      facultyRequestStats.rejected;

    const approvalRate =
      totalFacultyRequests === 0
        ? 0
        : Math.round(
            (facultyRequestStats.approved / totalFacultyRequests) * 100
          );

    const pendingTooLong = await FacultyRegister.countDocuments({
      status: "pending",
      createdAt: { $lt: last7Days },
    });

    const facultyRequestsThisMonth = await FacultyRegister.countDocuments({
      createdAt: { $gte: last30Days },
    });

    /* ================= RECENT ACTIVITY ================= */

    const recentFacultyRequests = await FacultyRegister.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select(
        "requesterName requesterEmail collegeName status createdAt"
      );

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("email role isVerified createdAt");

    /* ================= RESPONSE ================= */

    return res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
          unverified: unverifiedUsers,
          revoked: revokedUsers,
          new: newUsers,
        },

        facultyRequests: {
          ...facultyRequestStats,
          total: totalFacultyRequests,
          approvalRate, // %
          pendingTooLong,
          thisMonth: facultyRequestsThisMonth,
        },

        recentActivity: {
          facultyRequests: recentFacultyRequests,
          users: recentUsers,
        },

        alerts: {
          pendingFacultyRequestsOver7Days: pendingTooLong,
          unverifiedUsersOver7Days: await User.countDocuments({
            isVerified: false,
            createdAt: { $lt: last7Days },
          }),
        },
      },
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    return res.status(500).json({
      message: err.message || "Failed to load admin dashboard",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Optional query params (future-proof)
    const { role, verified } = req.query;

    const filter = {};

    if (role) filter.role = role;
    if (verified === "true") filter.isVerified = true;
    if (verified === "false") filter.isVerified = false;

    const users = await User.find(filter)
      .select("-password -passwordSetupToken -passwordSetupExpires")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({
      message: err.message || "Failed to fetch users",
    });
  }
};


export const pendingFacultyRequests = async (req, res) => {
  try {

    const pendingRequests = await FacultyRegister.find({ status : "pending"}).populate("college", "name");
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

    // 1️⃣ Get faculty request
    const request = await FacultyRegister.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Request already ${request.status}` });
    }

    // 2️⃣ Get requester user
    const requesterUser = await User.findById(request.userId);
    if (!requesterUser) {
      return res.status(404).json({ message: "Linked user not found" });
    }

    /* ================= APPROVAL ================= */
    if (status === "approved") {
      // 🔥 CRITICAL: use $set so nothing gets wiped later
      await User.findByIdAndUpdate(
        requesterUser._id,
        {
          $set: {
            college: request.college, // ✅ ObjectId
            isVerified: true,
            isRegistered: true,
          },
        },
        { new: true }
      );

      // Handle additional requested faculty
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
              college: request.college, // ✅ MUST SET HERE TOO
              isVerified: true,
              isRegistered: true,
              passwordSetupToken: hashedToken,
              passwordSetupExpires: Date.now() + 1000 * 60 * 60 * 24,
            });

            const setupLink = `${process.env.FRONTEND_URL}/set-password?token=${rawToken}`;

            try {
              await sendEmail({
                to: faculty.facultyEmail,
                subject: "Set Your Faculty Account Password",
                html: `
                  <p>Hello ${faculty.facultyName},</p>
                  <p>Your faculty account has been approved.</p>
                  <p>
                    <a href="${setupLink}">Set Password</a>
                  </p>
                  <p>This link expires in 24 hours.</p>
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

    /* ================= REJECTION ================= */
    if (status === "rejected") {
      request.rejectionReason = req.body?.reason || "";
    }

    // 3️⃣ Finalize request
    request.status = status;
    request.verifiedBy = req.user._id;
    request.verifiedAt = new Date();

    await request.save();

    return res.status(200).json({
      message: `Request ${status} successfully`,
    });
  } catch (err) {
    console.error("Faculty approval error:", err);
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
      .populate("college", "name")
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
// models/studentProfile.js
import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
    },

    // Identity / college info (used for initial verification)
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    prn: {
      type: String,          // Permanent Registration Number
      required: true,
      trim: true,
    },
    collegeId: {
      type: String,          // College ID number on the card
      required: true,
      trim: true,
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String, // e.g. "Second Year", "Final Year"
      required: true,
      trim: true,
    },

    // Contact
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Files / uploads (store URLs or filenames here)
    collegeIdImageUrl: {
      type: String,          // URL/path of ID card photo
      default: "",
    },
    resumeFileUrl: {
      type: String,          // URL/path of resume file/photo/PDF
      default: "",
    },

    // Extra profile info
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },

    // Verification & status (for initial identity check)
    status: {
      type: String,
      enum: ["draft", "pending", "verified", "rejected"],
      default: "draft",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // faculty who verified
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;

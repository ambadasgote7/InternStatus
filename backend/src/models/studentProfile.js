// models/studentProfile.js
import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /* =========================
       IDENTITY (LOCK AFTER REGISTER)
    ========================= */
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    prn: {
      type: String,
      required: true,
      trim: true,
    },

    collegeName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       ACADEMIC (EDITABLE)
    ========================= */
    course: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       FILES
    ========================= */
    collegeIdImageUrl: {
      type: String, // uploaded ID card path / cloud URL
      default: "",
    },

    resumeFileUrl: {
      type: String, // uploaded resume path / cloud URL
      default: "",
    },

    /* =========================
       PROFILE INFO
    ========================= */
    skills: {
      type: [String],
      default: [],
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    /* =========================
       VERIFICATION FLOW
    ========================= */
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

export default mongoose.model("StudentProfile", studentProfileSchema);

import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },

    // 🔹 Hiring Status (Company Controlled)
    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "interview",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      default: "applied",
      index: true,
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "applied",
            "shortlisted",
            "interview",
            "accepted",
            "rejected",
            "withdrawn",
          ],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // 🔹 Mentor Assignment (Only after accepted)
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // role: "Mentor"
    },

    // 🔹 Internship Progress Tracking
    internshipPhase: {
      type: String,
      enum: ["not_started", "ongoing", "completed"],
      default: "not_started",
    },

    // 🔹 Logbook Approval (Mentor Controlled)
    logbookApproved: {
      type: Boolean,
      default: false,
    },

    logbookApprovedAt: Date,

    logbookApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Mentor
    },

    // 🔹 Final Evaluation (Mentor Controlled)
    evaluationScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    mentorFeedback: {
      type: String,
      trim: true,
    },

    evaluationSubmittedAt: Date,
  },
  { timestamps: true }
);

// 🔒 Prevent duplicate applications
applicationSchema.index(
  { internship: 1, student: 1 },
  { unique: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;

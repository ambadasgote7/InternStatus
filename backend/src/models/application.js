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
    status: {
      type: String,
      enum: [
  "applied",
  "shortlisted",
  "interview",
  "accepted",
  "rejected",
  "withdrawn"
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
        "withdrawn"
      ],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // adjust to your company model
    }
  }
],
  },
  { timestamps: true }
);

// Unique constraint to prevent duplicates at DB level
applicationSchema.index(
  { internship: 1, student: 1 },
  { unique: true }
);

export default mongoose.model("Application", applicationSchema);

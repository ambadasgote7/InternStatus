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
      enum: ["applied", "accepted", "rejected", "withdrawn"],
      default: "applied",
      index: true,
    },
  },
  { timestamps: true }
);

// Unique constraint to prevent duplicates at DB level
applicationSchema.index(
  { internship: 1, student: 1 },
  { unique: true }
);

export default mongoose.model("Application", applicationSchema);

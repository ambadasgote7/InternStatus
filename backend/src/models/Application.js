import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true
    },

    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
      index: true
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorProfile",
      index: true
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyProfile",
      index: true
    },

    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "selected",
        "offer_accepted",
        "rejected",
        "withdrawn",
        "ongoing",
        "completed",
        "terminated"
      ],
      default: "applied",
      index: true
    },

    resumeSnapshot: String,

    skillsSnapshot: [String],

    studentSnapshot: {
      fullName: String,
      phoneNo: String,
      email: String,
      collegeName: String,
      courseName: String,
      specialization: String
    },

    // ADD THIS FIELD inside applicationSchema

mentorHistory: [
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorProfile"
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    removedAt: Date
  }
],

    appliedAt: {
      type: Date,
      default: Date.now
    },

    selectionDate: Date,
    offerAcceptedAt: Date,
    offerRejectedAt: Date,
    withdrawnAt: Date,

    internshipStartDate: Date,
    internshipEndDate: Date,

    completionDate: Date,
    terminationDate: Date,

    evaluationScore: {
      type: Number,
      min: 0,
      max: 100
    },

    mentorFeedback: String,
    facultyFeedback: String,

    certificateUrl: String,

    remarks: String
  },
  {
    timestamps: true
  }
);

applicationSchema.pre("save", async function () {

  if (this.status === "selected" && !this.selectionDate) {
    throw new Error("Selection date required");
  }

  if (this.status === "offer_accepted" && !this.offerAcceptedAt) {
    throw new Error("Offer acceptance date required");
  }

  if (this.status === "ongoing" && !this.internshipStartDate) {
    throw new Error("Start date required");
  }

  if (this.status === "completed" && !this.internshipEndDate) {
    throw new Error("End date required");
  }

});
/*
  UNIQUE → prevent duplicate applications
*/
applicationSchema.index(
  { student: 1, internship: 1 },
  { unique: true }
);

applicationSchema.virtual("report", {
  ref: "InternshipReport",
  localField: "_id",
  foreignField: "application",
  justOne: true
});

applicationSchema.set("toObject", { virtuals: true });
applicationSchema.set("toJSON", { virtuals: true });

const Application = mongoose.model(
  "Application",
  applicationSchema
);

export default Application;
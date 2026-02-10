import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      minlength: 15,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },

    applicationDeadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "open", "closed", "completed"],
      default: "draft",
    },

    stipend: {
      type: Number,
      min: 0,
    },

    mode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      required: true,
    },

    skillsRequired: [{
      type: String,
      trim: true,
    }],

    applicants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    }],

    maxApplicants: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.Internship ||
  mongoose.model("Internship", internshipSchema);

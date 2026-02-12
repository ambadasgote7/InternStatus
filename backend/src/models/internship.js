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
      ref: "CompanyRegister",
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

    stipendType: {
      type: String,
      enum: ["paid", "unpaid", "not_disclosed"],
      default: "not_disclosed",
      required: true,
    },

    stipendAmount: {
      type: Number,
      min: 0,
      validate: {
        validator: function (value) {
          if (this.stipendType === "paid") {
            return value != null;
          }
          return true;
        },
        message: "Stipend amount is required when stipendType is paid",
      },
    },

    positions: {
      type: Number,
      required: true,
      min: 1,
    },

    mode: {
      type: String,
      enum: ["remote", "onsite", "hybrid"],
      required: true,
    },

    skillsRequired: [
      {
        type: String,
        trim: true,
      },
    ],

    maxApplicants: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

internshipSchema.index({ company: 1, createdAt: -1 });
internshipSchema.index({ status: 1 });


export default mongoose.models.Internship ||
  mongoose.model("Internship", internshipSchema);

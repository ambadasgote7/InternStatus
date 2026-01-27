import mongoose from "mongoose";
import validator from "validator";

const companyRegisterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    requesterName: {
      type: String,
      required: true,
      trim: true,
    },

    requesterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      immutable: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid requester email");
        }
      },
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyWebsite: {
      type: String,
      trim: true,
      validate(value) {
        if (value && !validator.isURL(value, { require_protocol: true })) {
          throw new Error("Invalid company website URL");
        }
      },
    },

    verificationDocumentUrl: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
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
    },
  },
  { timestamps: true }
);

const CompanyRegister =
  mongoose.models.CompanyRegister ||
  mongoose.model("CompanyRegister", companyRegisterSchema);

export default CompanyRegister;

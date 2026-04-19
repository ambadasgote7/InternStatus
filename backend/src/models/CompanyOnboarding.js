import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    city: String,
    state: String,
    country: String
  },
  { _id: false }
);

const companyOnboardingSchema = new mongoose.Schema(
  {
    requesterName: {
      type: String,
      required: true
    },

    requesterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },

    requesterPhone: String,

    companyName: {
      type: String,
      required: true
    },

    locations: [locationSchema],

    website: String,


    emailDomain: String,

    industry: String,

    companySize: String,

    verificationDocumentUrl: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    reviewedAt: Date,

    rejectionReason: String,

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true
    },

    createdUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    notes: String
  },
  {
    timestamps: true
  }
);



const CompanyOnboarding = mongoose.model(
  "CompanyOnboarding",
  companyOnboardingSchema
);

export default CompanyOnboarding;
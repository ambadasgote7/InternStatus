import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    // 🔥 Student fills during setup
    prn: {
      type: String,
      trim: true
    },

    prnLocked: {
      type: Boolean,
      default: false
    },

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
      index: true
    },

    courseId: {
  type: mongoose.Schema.Types.ObjectId,
  required: true
},

    courseName: {
      type: String,
      required: true
    },

    specialization: {
      type: String,
      required: true
    },

    courseStartYear: {
      type: Number
    },

    courseEndYear: {
      type: Number
    },

    Year: {
      type: Number,
      required: true,
      min: 1,
      index: true
    },

    abcId: {
  type: String,
  minlength: 12,
  maxlength: 12,
  match: [/^\d{12}$/, "ABC ID must be a 12-digit number"]
},

    phoneNo: String,

    collegeIdCardUrl: String,

    resumeUrl: String,

    skills: [
      {
        type: String
      }
    ],

    bio: String,

    // 🔥 Profile completion tracking
    profileStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true
    },

    profileCompletedAt: Date,

    status: {
      type: String,
      enum: ["active", "unassigned", "inactive", "graduated"],
      default: "active"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    }
  },
  {
    timestamps: true
  }
);

//
// PRN unique per college (only when exists)
//
studentProfileSchema.index(
  { college: 1, prn: 1 },
  {
    unique: true,
    partialFilterExpression: {
      prn: { $type: "string" }
    }
  }
);

studentProfileSchema.index(
  { abcId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      abcId: { $exists: true, $ne: null }
    }
  }
);

const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);

export default StudentProfile;
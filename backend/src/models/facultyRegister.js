import mongoose from "mongoose";
import validator from "validator";

const facultyRegisterSchema = new mongoose.Schema(
  {
    // Requesting faculty (who submitted the form)
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
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid requester email");
        }
      },
    },

    // College details
    collegeName: {
      type: String,
      required: true,
      trim: true,
    },

    collegeWebsite: {
      type: String,
      trim: true,
    },

    verificationDocumentUrl: {
      type: String,
      required: true,
    },

    // Requested faculty users
   requestedFaculties: {
        type: [
            {
            facultyName: { type: String, trim: true },
            facultyEmail: {
                type: String,
                lowercase: true,
                trim: true,
                validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid faculty email");
                }
                },
            },
            },
        ],
        default: []   // 👈 IMPORTANT
    },

    // Admin verification
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

const FacultyRegister =
  mongoose.models.FacultyRegister ||
  mongoose.model("FacultyRegister", facultyRegisterSchema);


export default FacultyRegister;

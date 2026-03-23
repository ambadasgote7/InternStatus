  import mongoose from "mongoose";

  const courseSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true
      },

      durationYears: {
        type: Number,
        required: true
      },

      specializations: [
        {
          type: String
        }
      ],

      credits: {
  type: Number,
  required: true
},
    }
  );

  const collegeSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
        trim: true
      },

      // ✅ NEW FIELDS
      address: {
        type: String
      },

      phone: {
        type: String
      },

      description: {
        type: String
      },

      logoUrl: String,
      website: String,
      emailDomain: String,

      courses: [courseSchema],

      status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
      },

      approvedAt: Date
    },
    { timestamps: true }
  );


  const College = mongoose.model("College", collegeSchema);

  export default College;
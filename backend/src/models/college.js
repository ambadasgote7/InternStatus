// models/College.js
import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    location : {
      type : String,
      required : true,
      trim : true,
    },
    
  },
  { timestamps: true }
);

export default mongoose.model("College", collegeSchema);

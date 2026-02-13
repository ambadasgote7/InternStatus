import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Id");
        }
      },
    },

    password: {
      type: String,
      required: false,
    },

    role: {
      type: String,
      required: true,
      enum: ["Admin", "Student", "Faculty", "Company", "Mentor"],
    },

    // College reference (only for student & faculty)
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: function () {
        return (
          this.isRegistered &&
          (this.role === "faculty" || this.role === "student")
        );
      },
    },

    // Company reference (only for mentor)
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencing company user
      required: function () {
        return this.role === "mentor";
      },
    },

    roleStatus: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isRegistered: {
      type: Boolean,
      default: false,
    },

    passwordSetupToken: String,
    passwordSetupExpires: Date,
  },
  { timestamps: true }
);

// 🔐 Generate JWT
userSchema.methods.getJWT = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// 🔑 Validate Password
userSchema.methods.validatePassword = async function (userInputPassword) {
  return bcrypt.compare(userInputPassword, this.password);
};

// 🔒 Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

export default User;

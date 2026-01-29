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
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: {
        values: ["Admin", "Student", "Faculty", "Company"],
        message: "{VALUE} is not a valid role",
      },
    },

    roleStatus: {
      type: String,
      enum: ["active", "revoked"],
      default: "active"
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isRegistered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = function () {
  return jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
userSchema.methods.validatePassword = async function (userInputPassword) {
  return bcrypt.compare(userInputPassword, this.password);
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


const User = mongoose.model("User", userSchema);

export default User;
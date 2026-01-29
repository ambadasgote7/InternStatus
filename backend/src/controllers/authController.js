import { validateSignupData } from "../utils/validation.js";
import User from "../models/user.js";

export const signup = (role) => async (req, res) => {
  try {
    if (req.body.role) {
      return res.status(400).json({
        message: "Role cannot be set manually",
      });
    }

    // Validate the signup data
    validateSignupData(req.body);

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({
      email,
      password,
      role,
    });

    const token = user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({
      message: `${role} signup successful`,
      data: userObj,
      token,
    });
    
  } catch (err) {
    console.error("Signup error:", err);
    console.error("Error stack:", err.stack);
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.passwordSetupToken) {
  return res.status(400).json({
    message: "Please complete password setup first",
  });
}

    if (!user.password) {
  return res.status(400).json({
    message: "Password not set. Please set your password first.",
  });
}


    const isMatch = await user.validatePassword(password);
if (!isMatch) {
  return res.status(401).json({ message: "Invalid credentials" });
}


    const token = user.getJWT();

    // Set httpOnly cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      sameSite: "lax",
    });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "Login successful",
      data: userObj,   // includes role
      token,           // for frontend (Redux)
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 1. Basic validation
    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // 2. Hash incoming token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 3. Find user with valid token
    const user = await User.findOne({
      passwordSetupToken: hashedToken,
      passwordSetupExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password setup link",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Set password & clear token
    user.password = hashedPassword;
    user.passwordSetupToken = undefined;
    user.passwordSetupExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password set successfully. You can now log in.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to set password",
    });
  }
};


export const getMe = async (req, res) => {
  try {
    // userAuth middleware already attached the user document to req.user
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "User fetched successfully",
      data: userObj,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};
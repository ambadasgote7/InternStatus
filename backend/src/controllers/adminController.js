import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    const token = await jwt.sign(
      {role : "admin"},
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.cookie("admin_token", token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      message: "Admin login successful",
      token,  
    });

  } catch (err) {
    return res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
}

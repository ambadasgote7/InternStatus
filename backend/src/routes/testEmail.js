import express from "express";
import { sendEmail } from "../utils/sendEmail.js";

const testEmailRouter = express.Router();

testEmailRouter.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "ambadasgote06@gmail.com",
      subject: "Test Mail",
      html: "<h2>Email setup working ✅</h2>",
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Email failed", error: err.message });
  }
});

export default testEmailRouter;

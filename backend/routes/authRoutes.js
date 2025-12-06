import express from "express";
import {
  login,
  register,
  refresh,
  logout,
  me,
  verifyOTP,
  verifyRegisterOTP,
  resendOTP,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ------------------ KEEP ALIVE ROUTE ------------------
// authRoutes.js

router.get("/welcome", (req, res) => {
  console.log("🔥 /welcome ping received at:", new Date().toISOString());

  res.json({ message: "Server Awake!" });
});


// ------------------ REGISTER ------------------
router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOTP);

// ------------------ LOGIN + OTP ------------------
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// ------------------ TOKENS ------------------
router.post("/refresh", refresh); // final correct way

// ------------------ LOGOUT ------------------
router.post("/logout", logout);

// ------------------ PROTECTED ROUTE ------------------
router.get("/me", protect, me);

export default router;

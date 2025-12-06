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

// Register
router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOTP);

// Login / OTP
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// TOKEN REFRESH (Fix: allow GET + POST)
router.get("/refresh", refresh);
router.post("/refresh", refresh);

// Logout
router.post("/logout", logout);

// Protected route
router.get("/me", protect, me);

export default router;

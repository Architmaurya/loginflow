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

router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOTP);

router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", protect, me);

export default router;

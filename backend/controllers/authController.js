import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { sendMail } from "../utils/mailer.js";
import { buildEmailTemplate } from "../utils/emailTemplate.js";
import axios from "axios";

// TEMP STORAGE
const registerOTPs = {};
const loginOTPs = {};

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

// ---------------------------------------------------
// TOKENS
// ---------------------------------------------------
const sendTokens = (user, res) => {
  console.log("🔐 Sending login tokens for user:", user.email);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const isProd = process.env.NODE_ENV === "production";
  console.log("🌎 Environment:", isProd ? "PRODUCTION" : "DEVELOPMENT");

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  console.log("✅ Refresh token stored in cookie.");

  return res.json({
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
};

// ---------------------------------------------------
// REGISTER
// ---------------------------------------------------
export const register = async (req, res) => {
  console.log("📩 REGISTER Request received:", req.body);

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log("❌ Missing fields");
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (await User.findOne({ email })) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    // OTP
    const otp = generateOTP();
    registerOTPs[email] = {
      otp,
      password,
      expiresAt: Date.now() + 60 * 1000,
    };

    console.log("🔢 Registration OTP generated:", otp);

    await sendMail(
      email,
      "Your Registration OTP",
      buildEmailTemplate("Verify Email", "Enter this OTP to complete registration.", otp)
    );

    console.log("📧 Registration OTP email sent to:", email);

    return res.json({ message: "OTP sent", email });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// VERIFY REGISTER OTP
// ---------------------------------------------------
export const verifyRegisterOTP = async (req, res) => {
  console.log("🔍 VERIFY REGISTER OTP:", req.body);

  try {
    const { email, otp } = req.body;

    const data = registerOTPs[email];
    if (!data) {
      console.log("❌ No OTP found for:", email);
      return res.status(400).json({ message: "OTP expired or missing" });
    }

    console.log("📌 Stored OTP:", data.otp);

    if (Date.now() > data.expiresAt) {
      console.log("⏳ OTP expired for:", email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (Number(otp) !== Number(data.otp)) {
      console.log("❌ Invalid OTP. Provided:", otp);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await User.create({ email, password: hashedPassword, role: "user" });

    console.log("✅ User successfully created:", email);

    delete registerOTPs[email];

    await sendMail(email, "Welcome!", "<h2>Welcome!</h2><p>Your registration was successful 🎉</p>");

    console.log("📧 Welcome email sent.");

    // IST Time
    const now = new Date();
    const istDate = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const istTime = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" });

    console.log("🕒 IST Date:", istDate, "| Time:", istTime);

    // SEND to n8n
    try {
      console.log("🚀 Sending data to N8N:", process.env.N8N_WEBHOOK_URL);
      await axios.post(process.env.N8N_WEBHOOK_URL, {
        email,
        date: istDate,
        time: istTime,
      });
      console.log("✅ N8N accepted the request");
    } catch (err) {
      console.error("❌ N8N ERROR:", err.message);
      if (err.response) console.error("↳ Response:", err.response.data);
    }

    return res.json({ message: "Registration successful!" });

  } catch (error) {
    console.error("❌ VERIFY REGISTER OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// LOGIN (SEND OTP)
// ---------------------------------------------------
export const login = async (req, res) => {
  console.log("➡ LOGIN Request:", req.body);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ No user found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("❌ Wrong password for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    loginOTPs[email] = { otp, expiresAt: Date.now() + 60 * 1000 };

    console.log("🔢 Login OTP:", otp);

    await sendMail(
      email,
      "Your Login OTP",
      buildEmailTemplate("Login Verification", "Use this OTP to log in.", otp)
    );

    console.log("📧 Login OTP sent to:", email);

    return res.json({ message: "OTP sent", email });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// VERIFY LOGIN OTP
// ---------------------------------------------------
export const verifyOTP = async (req, res) => {
  console.log("🔍 VERIFY LOGIN OTP:", req.body);

  try {
    const { email, otp } = req.body;

    const data = loginOTPs[email];
    if (!data) {
      console.log("❌ No OTP found for:", email);
      return res.status(400).json({ message: "OTP expired" });
    }

    console.log("📌 Stored OTP:", data.otp);

    if (Date.now() > data.expiresAt) {
      console.log("⏳ OTP expired");
      return res.status(400).json({ message: "OTP expired" });
    }

    if (Number(otp) !== Number(data.otp)) {
      console.log("❌ Invalid OTP:", otp);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    delete loginOTPs[email];

    const user = await User.findOne({ email });

    console.log("✅ OTP verified. Logging in user:", email);

    return sendTokens(user, res);

  } catch (err) {
    console.error("❌ VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// RESEND OTP
// ---------------------------------------------------
export const resendOTP = async (req, res) => {
  console.log("🔁 RESEND OTP Request:", req.body);

  try {
    const { email, type } = req.body;

    const otp = generateOTP();
    const expiresAt = Date.now() + 60000;

    if (type === "register") {
      if (!registerOTPs[email]) registerOTPs[email] = {};
      registerOTPs[email].otp = otp;
      registerOTPs[email].expiresAt = expiresAt;
    }

    if (type === "login") {
      if (!loginOTPs[email]) loginOTPs[email] = {};
      loginOTPs[email].otp = otp;
      loginOTPs[email].expiresAt = expiresAt;
    }

    console.log(`🔄 New OTP for ${type}:`, otp);

    await sendMail(
      email,
      "New OTP",
      buildEmailTemplate("New OTP", "Here is your fresh OTP.", otp)
    );

    console.log("📧 Resend OTP Mail sent");

    res.json({ message: "OTP resent successfully" });

  } catch (err) {
    console.error("❌ RESEND OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// REFRESH TOKEN
// ---------------------------------------------------
export const refresh = async (req, res) => {
  console.log("🔄 REFRESH token request");

  try {
    const token = req.cookies.jwt;

    if (!token) {
      console.log("❌ No token found in cookies");
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    console.log("🔓 Decoded refresh token:", decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log("❌ User not found for token:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(user);

    console.log("✅ Access token refreshed");

    return res.json({
      accessToken,
      user: { id: user._id, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error("❌ REFRESH TOKEN ERROR:", err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

// ---------------------------------------------------
// LOGOUT
// ---------------------------------------------------
export const logout = async (req, res) => {
  console.log("🚪 LOGOUT request");

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  console.log("✔ Token cleared");

  return res.json({ message: "Logged out" });
};

// ---------------------------------------------------
// GET USER DETAILS
// ---------------------------------------------------
export const me = async (req, res) => {
  console.log("👤 ME request | User ID:", req.user?.id);

  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User data returned");

    res.json({ user });

  } catch (err) {
    console.error("❌ ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

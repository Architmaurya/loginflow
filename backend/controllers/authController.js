import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { sendMail } from "../utils/mailer.js";
import { buildEmailTemplate } from "../utils/emailTemplate.js";
import axios from "axios";

// In-memory stores for OTPs (Replace with Redis for production)
const registerOTPs = {};
const loginOTPs = {};

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

const sendTokens = (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
};

// ---------------- Registration (1-minute OTP) ----------------

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    // ---------------- PASSWORD VALIDATION ----------------
    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters long." });

    if (/^\d+$/.test(password))
      return res.status(400).json({ message: "Password cannot be only numbers." });

    if (/^(.)\1+$/.test(password))
      return res.status(400).json({ message: "Password cannot contain repeating characters." });

    const weakList = ["password", "123456", "qwerty", "111111", "abc123", "123123", "password123", "admin", "letmein", "welcome"];
    if (weakList.includes(password.toLowerCase()))
      return res.status(400).json({ message: "Password is too common and insecure." });

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
    if (!strongPassword.test(password))
      return res.status(400).json({
        message: "Password must include uppercase, lowercase, number, and special character (@$!%*?#&).",
      });

    // Check if user exists
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "User already exists" });

    // Generate OTP (1 minute)
    const otp = generateOTP();
    registerOTPs[email] = {
      otp,
      password,
      expiresAt: Date.now() + 1 * 60 * 1000,
    };

    // 🔹 BEAUTIFUL EMAIL TEMPLATE
    await sendMail(
      email,
      "Your Registration OTP",
      buildEmailTemplate(
        "Verify Your Email",
        "Use the OTP below to complete your registration.",
        otp
      )
    );

    return res.json({ message: "OTP sent to your email.", email });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- OTP Verification (Signup) ----------------

export const verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const data = registerOTPs[email];
    if (!data) return res.status(400).json({ message: "OTP expired or not found" });

    if (Date.now() > data.expiresAt)
      return res.status(400).json({ message: "OTP expired. Request a new one." });

    if (Number(otp) !== Number(data.otp))
      return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: "user",
    });

    delete registerOTPs[email];

    // -----------------------------------------
    // 🔹 BEAUTIFUL WELCOME EMAIL
    // -----------------------------------------
    await sendMail(
      email,
      "Welcome! 🎉",
      buildEmailTemplate("Welcome! 🎉", "Your registration was successful!")
    );

    // -----------------------------------------
    // 🔹 SEND DATA TO N8N (Google Sheet)
    // -----------------------------------------
    try {
      const payload = {
        email,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toISOString().split("T")[1].slice(0, 8),
      };

      console.log("🔥 Sending data to N8N...");
      console.log("➡ Webhook URL:", process.env.N8N_WEBHOOK_URL);
      console.log("➡ Payload:", payload);

      await axios.post(process.env.N8N_WEBHOOK_URL, payload);

      console.log("✅ N8N request success!");
    } catch (err) {
      console.error("❌ N8N Webhook Error:");
      console.error("   • Message:", err.message);

      if (err.response) {
        console.error("   • Status:", err.response.status);
        console.error("   • Response Data:", err.response.data);
      }

      if (err.request) {
        console.error("   • No response received from N8N");
      }
    }

    return res.json({ message: "Registration successful!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};




// ---------------- Login with OTP (1 minute) ----------------

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!await bcrypt.compare(password, user.password))
      return res.status(400).json({ message: "Invalid credentials" });

    const otp = generateOTP();
    loginOTPs[email] = {
      otp,
      expiresAt: Date.now() + 1 * 60 * 1000,
    };

    // 🔹 BEAUTIFUL EMAIL TEMPLATE
    await sendMail(
      email,
      "Your Login OTP",
      buildEmailTemplate(
        "Login Verification",
        "Use the OTP below to login.",
        otp
      )
    );

    return res.json({ message: "OTP sent to your email", email });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Verify Login OTP ----------------

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const stored = loginOTPs[email];
    if (!stored) return res.status(400).json({ message: "OTP expired or not found" });

    if (Date.now() > stored.expiresAt)
      return res.status(400).json({ message: "OTP expired." });

    if (Number(otp) !== Number(stored.otp))
      return res.status(400).json({ message: "Invalid OTP" });

    delete loginOTPs[email];

    const user = await User.findOne({ email });
    return sendTokens(user, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Resend OTP (Login + Register) ----------------

export const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    const otp = generateOTP();
    const expiresAt = Date.now() + 1 * 60 * 1000;

    if (type === "register") {
      if (!registerOTPs[email]) registerOTPs[email] = {};
      registerOTPs[email].otp = otp;
      registerOTPs[email].expiresAt = expiresAt;

      await sendMail(
        email,
        "New Registration OTP",
        buildEmailTemplate(
          "New Registration OTP",
          "Here is your new OTP. It is valid for 1 minute.",
          otp
        )
      );
    }

    if (type === "login") {
      if (!loginOTPs[email]) loginOTPs[email] = {};
      loginOTPs[email].otp = otp;
      loginOTPs[email].expiresAt = expiresAt;

      await sendMail(
        email,
        "New Login OTP",
        buildEmailTemplate(
          "New Login OTP",
          "Here is your new OTP. It is valid for 1 minute.",
          otp
        )
      );
    }

    return res.json({ message: "OTP resent successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Refresh / Logout / Me ----------------

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const accessToken = generateAccessToken(user);

    return res.json({
      accessToken,
      user: { id: user._id, email: user.email, role: user.role },
    });

  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.json({ message: "Logged out" });
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

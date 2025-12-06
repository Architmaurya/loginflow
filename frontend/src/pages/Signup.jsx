import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import api from "../api/axios";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [serverEmail, setServerEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 OTP timer set to 1 minute (60 sec)
  const [timer, setTimer] = useState(60);

  // ---------------- TIMER HANDLER ----------------
  useEffect(() => {
    if (step !== "otp") return;
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, step]);

  const formatTime = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  // ---------------- HANDLE INPUT CHANGE ----------------
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ---------------- PASSWORD VALIDATION + SEND OTP ----------------
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const password = form.password;

    // ---------------- PASSWORD VALIDATION ----------------

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (/^\d+$/.test(password)) {
      setError("Password cannot be only numbers.");
      return;
    }

    if (/^(.)\1+$/.test(password)) {
      setError("Password cannot contain repeating characters.");
      return;
    }

    const weakList = [
      "password",
      "123456",
      "qwerty",
      "111111",
      "abc123",
      "123123",
      "password123",
      "admin",
      "welcome",
      "letmein",
    ];
    if (weakList.includes(password.toLowerCase())) {
      setError("Password is too common and insecure.");
      return;
    }

    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

    if (!strongPassword.test(password)) {
      setError(
        "Password must include uppercase, lowercase, number and special character (@$!%*?#&)."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ---------------- PASSWORD VALID → SEND OTP ----------------
    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        email: form.email,
        password: form.password,
      });

      setServerEmail(res.data.email);
      setStep("otp");
      setTimer(60); // 🔥 RESET TO 1 MIN
      setMessage("OTP sent to your email. Please enter it below.");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/verify-register-otp", {
        email: serverEmail,
        otp,
      });

      setMessage(res.data.message || "Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESEND OTP ----------------
  const handleResend = async () => {
    setError("");
    setMessage("");

    try {
      await api.post("/auth/resend-otp", {
        email: serverEmail,
        type: "register",
      });

      setTimer(60); // 🔥 RESET TIMER TO 1 MIN AFTER RESEND
      setMessage("New OTP sent successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  // ---------------- UI ----------------
  return (
    <AuthLayout
      title={step === "form" ? "Create an account" : "Verify your email"}
      subtitle={
        step === "form"
          ? "Sign up and you will receive a registration OTP."
          : `We have sent a 4-digit OTP to ${serverEmail}.`
      }
    >
      {step === "form" ? (
        <form className="space-y-4" onSubmit={handleSubmitForm}>
          {error && (
            <div className="text-sm text-rose-300 bg-rose-900/40 border border-rose-600 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-emerald-300 bg-emerald-900/40 border border-emerald-600 rounded-lg px-3 py-2">
              {message}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Email</label>
            <input
              type="email"
              name="email"
              className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Password</label>
            <input
              type="password"
              name="password"
              className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Must include A-Z, a-z, 0-9 & special char"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium py-2.5 transition"
          >
            {loading ? "Sending OTP..." : "Sign up & Get OTP"}
          </button>

          <p className="text-xs text-center text-slate-400 mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleVerifyOTP}>
          {error && (
            <div className="text-sm text-rose-300 bg-rose-900/40 border border-rose-600 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {message && (
            <div className="text-sm text-emerald-300 bg-emerald-900/40 border border-emerald-600 rounded-lg px-3 py-2">
              {message}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm text-slate-200">4-digit OTP</label>
            <input
              type="text"
              maxLength={4}
              className="w-full tracking-[0.5em] text-center rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="1234"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          <p className="text-xs text-slate-400 text-center">
            OTP expires in:{" "}
            <span className="text-emerald-400 font-medium">{formatTime()}</span>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium py-2.5 transition"
          >
            {loading ? "Verifying..." : "Verify OTP & Register"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={timer > 0}
            className="w-full mt-2 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium py-2.5 transition"
          >
            {timer > 0 ? `Resend OTP in ${formatTime()}` : "Resend OTP"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("form");
              setOtp("");
              setTimer(60); // 🔥 reset to 1 min
              setError("");
              setMessage("");
            }}
            className="w-full mt-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-medium py-2.5 transition"
          >
            Back to sign up
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default Signup;

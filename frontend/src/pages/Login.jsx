import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { setAuthFromLoginResponse } = useAuth();

  const [step, setStep] = useState("credentials"); // 'credentials' | 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [serverEmail, setServerEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 OTP Timer: 1 minute (60s)
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

  // ---------------- SEND OTP (STEP 1) ----------------
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });

      setServerEmail(res.data.email);
      setStep("otp");
      setTimer(60); // 🔥 Reset timer to 1 minute
    } catch (err) {
      setError(err.response?.data?.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY OTP (STEP 2) ----------------
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", {
        email: serverEmail,
        otp,
      });

      setAuthFromLoginResponse(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESEND OTP ----------------
  const handleResend = async () => {
    setError("");

    try {
      await api.post("/auth/resend-otp", {
        email: serverEmail,
        type: "login",
      });

      setTimer(60); // 🔥 Reset timer again to 1 minute
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <AuthLayout
      title={step === "credentials" ? "Welcome back" : "Enter OTP"}
      subtitle={
        step === "credentials"
          ? "Login with your email and password. You will receive a 4-digit OTP."
          : `We have sent a 4-digit OTP to ${serverEmail}.`
      }
    >
      {/* ---------------- LOGIN STEP 1 ---------------- */}
      {step === "credentials" ? (
        <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
          {error && (
            <div className="text-sm text-rose-300 bg-rose-900/40 border border-rose-600 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Email</label>
            <input
              type="email"
              className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Password</label>
            <input
              type="password"
              className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium py-2.5 transition"
          >
            {loading ? "Sending OTP..." : "Login & Get OTP"}
          </button>

          <p className="text-xs text-center text-slate-400 mt-3">
            Don't have an account?{" "}
            <Link to="/signup" className="text-emerald-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      ) : (
        /* ---------------- OTP STEP 2 ---------------- */
        <form className="space-y-4" onSubmit={handleOTPSubmit}>
          {error && (
            <div className="text-sm text-rose-300 bg-rose-900/40 border border-rose-600 rounded-lg px-3 py-2">
              {error}
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
            <span className="text-emerald-400 font-medium">
              {formatTime()}
            </span>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 disabled:cursor-not-allowed text-sm font-medium py-2.5 transition"
          >
            {loading ? "Verifying..." : "Verify OTP & Login"}
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
              setStep("credentials");
              setOtp("");
              setError("");
              setTimer(60); // 🔥 Reset to 1-minute timer
            }}
            className="w-full mt-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-medium py-2.5 transition"
          >
            Back to login
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default Login;

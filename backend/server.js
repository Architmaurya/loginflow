import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());

// ----------------------
// FIXED CORS CONFIG
// ----------------------
const rawOrigins = process.env.FRONTEND_URL || "";
const allowedOrigins = rawOrigins.split(",");

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ BLOCKED BY CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies
  })
);

// ----------------------
// ROUTES
// ----------------------
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Advanced Auth API running" });
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

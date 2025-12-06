import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

// Connect Database
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Allowed Frontend Origin (IMPORTANT)
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: FRONTEND_URL,  
    credentials: true,     
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// API Routes
app.use("/api/auth", authRoutes);

// Default Route
app.get("/", (req, res) => {
  res.json({ message: "Advanced Auth API is running 🚀" });
});

// Server Start
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

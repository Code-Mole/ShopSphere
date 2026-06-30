import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import router from "./routes/index.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// Enable CORS — only allow our frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Sanitize MongoDB query injection (e.g. $where attacks)
app.use(mongoSanitize());

// Global rate limiter — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use("/api", limiter);

// ─── General Middleware ───────────────────────────────────────────────────────

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// HTTP request logger (development only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use("/api/v1", router);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ success: true, message: "ShopSphere API is running 🚀" });
});

// ─── Error Handling ───────────────────────────────────────────────────────────

// 404 handler — must come AFTER all routes
app.use(notFound);

// Global error handler — must be last
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

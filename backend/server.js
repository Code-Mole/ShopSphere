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
import webhookRoutes from "./routes/webhook.routes.js"; // NEW

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// It needs the raw request body to verify Paystack's signature.
app.use("/api/v1/webhooks", webhookRoutes);

app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.json({ success: true, message: "ShopSphere API is running 🚀" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

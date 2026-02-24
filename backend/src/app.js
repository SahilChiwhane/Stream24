import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";

import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import subscriptionRoutes from "./modules/subscription/subscription.routes.js";
import contentRoutes from "./modules/content/content.routes.js";
import watchHistoryRoutes from "./modules/watch-history/watchHistory.routes.js";
import seriesRoutes from "./modules/series/series.routes.js";
import playbackRoutes from "./modules/playback/playback.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import recommendationRoutes from "./modules/recommendations/recommendations.routes.js";
import animeRoutes from "./modules/anime/anime.routes.js";
import previewRoutes from "./modules/preview/preview.routes.js";
import preferencesRoutes from "./modules/preferences/preferences.routes.js";
import wishlistRoutes from "./modules/wishlist/wishlist.routes.js";
import searchRoutes from "./modules/search/search.routes.js";
import { devAuthBypass } from "./middlewares/devAuth.middleware.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { cacheMiddleware } from "./middlewares/cache.middleware.js";

const app = express();

// --- CORE MIDDLEWARE ---
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (
        env.ALLOWED_ORIGINS.indexOf(origin) !== -1 ||
        env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));

// --- SERVER HARDENING ---
app.use(helmet()); // Security Headers
// Rate Limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- HEALTH CHECK ---
app.get("/", (req, res) =>
  res.json({
    ok: true,
    service: "Stream24 Backend API",
    env: process.env.NODE_ENV,
  }),
);

// --- API ROUTES (v1 namespace) ---
// DEBUG: Watch History Traffic Monitor
app.use("/api/v1/watch-history", (req, res, next) => {
  if (req.method === "POST" || req.method === "GET") {
    const time = new Date().toLocaleTimeString();
    console.log(
      `\n\x1b[44m[WATCH-HISTORY TRAFFIC]\x1b[0m ${time} | ${req.method} | Body:`,
      JSON.stringify(req.body),
    );
  }
  next();
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

// READ-HEAVY ROUTES (Cached)
app.use("/api/v1/content", cacheMiddleware(30), contentRoutes); // Cache 30s
app.use("/api/v1/anime", cacheMiddleware(30), animeRoutes);
app.use("/api/v1/series", cacheMiddleware(30), seriesRoutes);
app.use("/api/v1/preview", cacheMiddleware(30), previewRoutes);
app.use("/api/v1/search", cacheMiddleware(30), searchRoutes); // Cache 30s
app.use("/api/v1/recommendations", cacheMiddleware(30), recommendationRoutes);

// DYNAMIC/USER ROUTES (No Cache)
app.use("/api/v1/watch-history", watchHistoryRoutes);
app.use("/api/v1/playback", playbackRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/preferences", preferencesRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

export default app;

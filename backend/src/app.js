// Production Build: 2026-02-26
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// --- CORE MIDDLEWARE ---
app.use(compression()); // ⚡ Compress all responses
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps/curl)
      if (!origin) return callback(null, true);

      const isAllowed =
        env.ALLOWED_ORIGINS.includes(origin) ||
        env.ALLOWED_ORIGINS.includes("*") ||
        origin.endsWith(".vercel.app") || // 🚀 Auto-allow Vercel previews
        env.NODE_ENV === "development";

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(env.NODE_ENV === "production" ? "tiny" : "dev"));

// --- SERVER HARDENING ---
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.razorpay.com",
          "https://www.youtube.com",
          "https://s.ytimg.com",
        ],
        "frame-src": [
          "'self'",
          "https://api.razorpay.com",
          "https://www.youtube.com",
          "https://www.youtube-nocookie.com",
        ],
        "img-src": [
          "'self'",
          "data:",
          "https://*.tmdb.org",
          "https://image.tmdb.org",
          "https://lh3.googleusercontent.com",
        ],
        "connect-src": [
          "'self'",
          "https://api.razorpay.com",
          "https://firebasestorage.googleapis.com",
          "https://www.googleapis.com",
        ],
      },
    },
  }),
);
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

// --- STATIC ASSETS (Production) ---
const buildPath = path.join(__dirname, "../../frontend/build");
app.use(express.static(buildPath));

// Catch-all for React Routing
app.get("*", (req, res, next) => {
  if (req.url.startsWith("/api/v1")) return next();
  res.sendFile(path.join(buildPath, "index.html"), (err) => {
    if (err) {
      // If we don't have a build folder yet, just show a friendly message
      res.status(404).json({
        ok: false,
        message:
          "Production build not found. Run 'npm run build' in the frontend folder.",
      });
    }
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

export default app;

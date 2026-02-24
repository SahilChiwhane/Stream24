import dotenv from "dotenv";
dotenv.config(); // 🔐 MUST be first

import { env } from "./config/env.js";
import app from "./app.js";
import logger from "./utils/logger.js";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`Stream24 API is live on port ${env.PORT}`);
  logger.auth(`Connect on Network: http://192.168.1.109:${env.PORT}`);
  logger.debug(`Environment: ${env.NODE_ENV}`);
});

// --- INDUSTRIAL GRACEFUL SHUTDOWN ---
const shutdown = (signal) => {
  logger.warn(`${signal} received. Powering down...`);
  server.close(() => {
    logger.info("Server decoupled cleanly. Port released.");
    process.exit(0);
  });

  // If server takes too long to close, force exit
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

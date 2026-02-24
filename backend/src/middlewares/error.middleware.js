import logger from "../utils/logger.js";
import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  const isProd = env.NODE_ENV === "production";
  const status = err.status || 500;

  // Industrial Logging
  logger.error(
    `[API-ERROR] ${status} | ${req.method} ${req.originalUrl} | Msg: ${err.message}`,
  );

  if (!isProd && err.stack) {
    console.error(err.stack);
  }

  return res.status(status).json({
    success: false,
    status,
    message:
      isProd && status === 500
        ? "An internal server error occurred"
        : err.message,
    ...(isProd ? {} : { stack: err.stack }),
    requestId: req.id || Math.random().toString(36).substring(7),
  });
};

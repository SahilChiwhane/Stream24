import { authAdmin } from "../config/firebase.js";
import { failure } from "../utils/response.js";
import logger from "../utils/logger.js";

export const verifyAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      logger.warn(`[AUTH] Missing Bearer token for ${req.method} ${req.url}`);
      return failure(res, "Authentication token missing", 401);
    }

    const token = header.split(" ")[1];
    if (!token) {
      logger.warn(`[AUTH] Empty token for ${req.method} ${req.url}`);
      return failure(res, "Authentication token empty", 401);
    }

    // Verify token (with revocation check)
    const decoded = await authAdmin.verifyIdToken(token, true);
    logger.debug(`[AUTH] Verified token for ${decoded.email} (${decoded.uid})`);

    // Normalize session identity
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      emailVerified: decoded.email_verified === true,
      role: decoded.role || "user",
      name: decoded.name || null,
      picture: decoded.picture || null,
      claims: decoded,
    };

    return next();
  } catch (err) {
    logger.error("Auth Middleware Error:", err);

    const message =
      err.code === "auth/id-token-expired"
        ? "Session expired — please sign in again"
        : err.code === "auth/id-token-revoked"
          ? "Session revoked — please reauthenticate"
          : "Invalid authentication token";

    return failure(res, message, 401);
  }
};

import { failure } from "../utils/response.js";

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    const userRole =
      req?.user?.claims?.role ||
      (req?.user?.isAdmin ? "admin" : null);

    if (!userRole || !roles.includes(userRole)) {
      return failure(res, "Forbidden — insufficient permission", 403);
    }

    next();
  };

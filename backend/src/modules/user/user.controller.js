import { success } from "../../utils/response.js";
import * as service from "./user.service.js"; // Import as namespace
import { getOrCreateUser, updateUserProfile } from "./user.service.js"; // Keep individual extracts for existing code
import logger from "../../utils/logger.js";

export const getMe = async (req, res, next) => {
  try {
    const profile = await getOrCreateUser(req.user.uid, {
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.picture,
    });

    return success(res, { profile }, "User profile loaded");
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    // Import validation at runtime to avoid circular dependencies
    const { validateProfileUpdate } = await import("./user.validation.js");

    // Validate input
    const validatedData = validateProfileUpdate(req.body);

    const updated = await updateUserProfile(req.user.uid, validatedData);

    return success(res, { profile: updated }, "Profile updated");
  } catch (err) {
    // Handle validation errors
    if (err.status === 400 && err.details) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          fields: err.details,
        },
      });
    }

    next(err);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    await service.deleteUser(req.user.uid);
    return success(res, { deleted: true }, "Account deleted");
  } catch (err) {
    next(err);
  }
};
export const changePassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    await service.updatePassword(req.user.uid, newPassword);
    return success(res, null, "Password updated successfully");
  } catch (err) {
    next(err);
  }
};

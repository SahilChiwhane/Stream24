import Joi from "joi";

/**
 * Validation schema for profile updates
 */
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).optional().allow(""),
  lastName: Joi.string().trim().min(1).max(50).optional().allow(""),
  avatarId: Joi.string().allow(null, "").optional(),
  // Allow both full URIs and relative paths for avatarUrl
  avatarUrl: Joi.string().allow(null, "").optional(),
}).unknown(true); // Allow other fields to pass through

/**
 * Validate profile update payload
 */
export const validateProfileUpdate = (data) => {
  const { error, value } = updateProfileSchema.validate(data, {
    abortEarly: false,
    stripUnknown: false, // Keep unknown fields
  });

  if (error) {
    const validationError = new Error("Validation failed");
    validationError.status = 400;
    validationError.details = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    throw validationError;
  }

  return value;
};

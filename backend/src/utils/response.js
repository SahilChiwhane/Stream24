export const success = (
  res,
  data = {},
  message = "OK",
  status = 200
) => {
  return res.status(status).json({
    success: true,
    status,
    message,
    data,
  });
};

export const failure = (
  res,
  message = "Request failed",
  status = 500,
  details = null
) => {
  const isProd = process.env.NODE_ENV === "production";

  return res.status(status).json({
    success: false,
    status,

    // In prod, never leak internal messages for 5xx
    message:
      isProd && status >= 500
        ? "Internal server error"
        : message,

    // Optional structured details (dev / controlled cases)
    ...(details ? { details } : {}),
  });
};

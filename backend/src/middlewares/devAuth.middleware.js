export const devAuthBypass = (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    // Fake user injected for development
    req.user = {
      uid: "dev-user-123",
      email: "dev@local.test",
    };
  }
  next();
};

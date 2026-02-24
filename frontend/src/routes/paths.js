export const PATHS = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_EMAIL: "/verify-email",
  PLANS: "/plans",
  DASHBOARD: "/browse",

  DETAILS: (mediaType, id) => `/details/${mediaType}/${id}`,
  WATCH: (mediaType, id) => `/watch/${mediaType}/${id}`,
};

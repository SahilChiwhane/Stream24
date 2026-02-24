export function routeByAccountStatus(status) {
  switch (status) {
    case "SIGNED_UP":
      return "/verify-email";
    case "EMAIL_VERIFIED":
      return "/plans";
    case "ACCOUNT_READY":
      return "/movies";
    default:
      return "/signup";
  }
}

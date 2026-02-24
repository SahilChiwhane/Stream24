import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthRedirect() {
  const { user, loading, initialized } = useAuth();

  if (!initialized || loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.accountStatus) {
    case "SIGNED_UP":
      return <Navigate to="/verify-email" replace />;

    case "EMAIL_VERIFIED":
      return <Navigate to="/plans" replace />;

    case "ACCOUNT_READY":
      return <Navigate to="/movies" replace />;

    default:
      return <Navigate to="/" replace />;
  }
}

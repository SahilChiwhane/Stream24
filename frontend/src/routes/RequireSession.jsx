// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../features/auth/context/AuthContext";

// export default function RequireSession({ children }) {
//   const { user, loading, initialized } = useAuth();
//   const location = useLocation();

//   if (!initialized || loading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">
//         Securing session…
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace state={{ from: location }} />;
//   }

//   return children;
// }

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { auth } from "../services/firebase";
import Loader from "../shared/components/Loader";
import { routeByAccountStatus } from "../features/auth/utils/routeBySession";

const DEV_BYPASS_AUTH = false;

export default function RequireSession({ children }) {
  const location = useLocation();
  const { user, initialized } = useAuth();

  if (DEV_BYPASS_AUTH) return children;

  // 🛡️ WAIT if not initialized OR if we have a Firebase user but context hasn't synced yet
  if (!initialized || (!user && auth.currentUser)) {
    return <Loader />;
  }

  // 1. Unauthenticated -> Login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Lifecycle Check -> Enforce flow (Verify Email -> Plans -> Browse)
  // Only allow access to the "Main App" (/movies, /anime, /settings, etc.)
  // if the account status is ACCOUNT_READY.
  const isAccountReady = user.accountStatus === "ACCOUNT_READY";

  // Define routes that are part of the core app experience
  const isBrowsingRoute =
    location.pathname.startsWith("/movies") ||
    location.pathname.startsWith("/anime") ||
    location.pathname.startsWith("/tvshows") ||
    location.pathname.startsWith("/details") ||
    location.pathname.startsWith("/search") ||
    location.pathname.startsWith("/wishlist");

  if (isBrowsingRoute && !isAccountReady) {
    const target = routeByAccountStatus(user.accountStatus);
    return <Navigate to={target} replace />;
  }

  return children;
}

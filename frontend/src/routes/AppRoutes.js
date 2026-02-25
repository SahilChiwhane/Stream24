import { Routes, Route, useLocation } from "react-router-dom";
import React, { Suspense, lazy } from "react"; // Added React and Suspense

import RequireSession from "./RequireSession";
import PublicLayout from "../layouts/PublicLayout";
import AppLayout from "../layouts/AppLayout";
import SimpleLayout from "../layouts/SimpleLayout";

import Loader from "../shared/components/Loader"; // Corrected path if needed, but it was already correct

// Pages
const LandingPage = lazy(() => import("../features/landing/pages/LandingPage"));
const Login = lazy(() => import("../features/auth/pages/Login"));
const Signup = lazy(() => import("../features/auth/pages/SignUp"));
const VerifyEmail = lazy(() => import("../features/auth/pages/VerifyEmail"));
const AuthRedirect = lazy(() => import("../features/auth/pages/AuthRedirect"));
const Plans = lazy(() => import("../features/subscription/pages/Plans"));

const Movies = lazy(() => import("../features/browse/pages/Movies"));
const Anime = lazy(() => import("../features/browse/pages/Anime"));
const TvShows = lazy(() => import("../features/browse/pages/TvShows"));

const Player = lazy(() => import("../features/player/pages/Player"));
const Details = lazy(() => import("../features/details/pages/Details"));
const Search = lazy(() => import("../features/search/pages/Search"));
const Wishlist = lazy(() => import("../features/wishlist/pages/Wishlist"));
const Settings = lazy(() => import("../features/profile/pages/Settings"));
const Account = lazy(() => import("../features/profile/pages/Account"));

const PaymentPage = lazy(
  () => import("../features/subscription/pages/PaymentPage"),
);
const CheckoutPage = lazy(
  () => import("../features/subscription/pages/CheckoutPage"),
);
const SubscriptionConfirmation = lazy(
  () => import("../features/subscription/pages/SubscriptionConfirmation"),
);
const SubscriptionFailed = lazy(
  () => import("../features/subscription/pages/SubscriptionFailed"),
);

const NotFound = lazy(() => import("../shared/pages/NotFound"));
const AboutContact = lazy(() => import("../pages/AboutContact"));

export default function AppRoutes() {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = React.useState(false);

  React.useEffect(() => {
    // Industrial Navigation Splash
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 250);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Suspense fallback={<Loader />}>
      {isNavigating && <Loader fullPage={true} />}{" "}
      {/* Added fullPage={false} as per instruction context */}
      <Routes>
        {/* ---------------- PUBLIC AREA ---------------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/redirect" element={<AuthRedirect />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/about" element={<AboutContact />} />
          <Route path="/contact" element={<AboutContact />} />
        </Route>

        {/* ---------------- AUTHENTICATED APP ---------------- */}
        <Route
          element={
            <RequireSession>
              <AppLayout />
            </RequireSession>
          }
        >
          {/* <Route index element={<Navigate to="/movies" replace />} /> */}
          <Route path="/movies" element={<Movies />} />
          <Route path="/anime" element={<Anime />} />
          <Route path="/tvshows" element={<TvShows />} />
          <Route path="/details/:mediaType/:id" element={<Details />} />
          <Route path="/search" element={<Search />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account" element={<Account />} />
        </Route>

        {/* ---------------- SIMPLE LAYOUT (Payment, Checkout) ---------------- */}
        <Route
          element={
            <RequireSession>
              <SimpleLayout />
            </RequireSession>
          }
        >
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/subscription/confirmation"
            element={<SubscriptionConfirmation />}
          />
          <Route path="/subscription/failed" element={<SubscriptionFailed />} />
        </Route>

        {/* ---------------- PLAYER (no layout) ---------------- */}
        <Route
          path="/watch/:mediaType/:id"
          element={
            <RequireSession>
              <Player />
            </RequireSession>
          }
        />

        {/* ---------------- FALLBACK ---------------- */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { PreferencesProvider } from "./features/profile/context/PreferencesContext";
import { WishlistProvider } from "./features/wishlist/context/WishlistContext";
import { WatchHistoryProvider } from "./features/watch-history/context/WatchHistoryContext";
import CookieConsent from "./shared/components/CookieConsent";

export default function App() {
  return (
    <PreferencesProvider>
      <WishlistProvider>
        <WatchHistoryProvider>
          <AppRoutes />
          <CookieConsent />
        </WatchHistoryProvider>
      </WishlistProvider>
    </PreferencesProvider>
  );
}

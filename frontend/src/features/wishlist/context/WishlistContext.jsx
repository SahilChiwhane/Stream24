import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchWishlist,
  addWishlist,
  removeWishlist,
} from "../services/wishlist.service";

import { useAuth } from "../../auth/context/AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, initialized } = useAuth();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!initialized) return;

    let mounted = true;

    if (!user) {
      setItems([]);
      setLoaded(true);
      return;
    }

    setLoaded(false);
    fetchWishlist()
      .then((data) => {
        if (mounted) {
          setItems(data || []);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load wishlist", err);
        if (mounted) setLoaded(true);
      });

    return () => {
      mounted = false;
    };
  }, [user, initialized]);

  // Optimistic add: update UI immediately, rollback if backend fails
  const add = (item) => {
    const optimisticItem = { ...item, addedAt: Date.now() };
    setItems((prev) => {
      // Don't add duplicates
      if (prev.some((i) => String(i.id) === String(item.id))) return prev;
      return [optimisticItem, ...prev];
    });

    // Fire backend request in background — don't await
    addWishlist(item).catch((err) => {
      console.error("[Wishlist] Add failed, rolling back:", err);
      // Rollback: remove the optimistically added item
      setItems((prev) => prev.filter((i) => String(i.id) !== String(item.id)));
    });
  };

  // Optimistic remove: update UI immediately, rollback if backend fails
  const remove = (id) => {
    // Snapshot current items for potential rollback
    setItems((prev) => {
      const snapshot = prev;
      const next = prev.filter((i) => String(i.id) !== String(id));

      // Fire backend request in background — don't await
      removeWishlist(id).catch((err) => {
        console.error("[Wishlist] Remove failed, rolling back:", err);
        // Rollback: restore the removed item
        setItems(snapshot);
      });

      return next;
    });
  };

  const exists = (id) => {
    return items.some((i) => String(i.id) === String(id));
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        loaded,
        add,
        remove,
        exists,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}

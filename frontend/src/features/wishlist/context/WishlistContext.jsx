import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchWishlist,
  addWishlist,
  removeWishlist,
} from "../services/wishlist.service";

import { useAuth } from "../../auth/context/AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
  }, [user]);

  const add = async (item) => {
    await addWishlist(item);
    setItems((prev) => [{ ...item, addedAt: Date.now() }, ...prev]);
  };

  const remove = async (id) => {
    await removeWishlist(id);
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
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

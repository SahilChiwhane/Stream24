import { useWishlist } from "../context/WishlistContext";

export function useWishlistCount() {
  return useWishlist().count;
}

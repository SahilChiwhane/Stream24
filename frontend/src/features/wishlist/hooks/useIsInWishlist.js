import { useWishlist } from "../context/WishlistContext";

export function useIsInWishlist(id) {
  const { exists } = useWishlist();
  return exists(id);
}

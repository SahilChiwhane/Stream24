import api from "../../../services/api";

export async function fetchWishlist() {
  const res = await api.get("/wishlist");
  if (!res.data?.success) throw new Error("Failed to load wishlist");
  return res.data.data;
}

export async function addWishlist(item) {
  const res = await api.post("/wishlist", item);
  if (!res.data?.success) throw new Error("Failed to add wishlist");
  return true;
}

export async function removeWishlist(id) {
  const res = await api.delete(`/wishlist/${id}`);
  if (!res.data?.success) throw new Error("Failed to remove wishlist");
  return true;
}

export async function checkWishlist(id) {
  const res = await api.get(`/wishlist/${id}`);
  if (!res.data?.success) throw new Error("Failed to check wishlist");
  return res.data.data.exists;
}

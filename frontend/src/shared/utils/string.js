// src/utils/string.js
export function getInitials(name = "") {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic pastel-ish background color from a string (use for initials avatar).
 * Returns a CSS color string like '#c1d4f0'
 */
export function initialsBgColor(seed = "") {
  // simple hash -> hue
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  // produce HSL pastel color
  return `hsl(${h} 60% 65%)`;
}

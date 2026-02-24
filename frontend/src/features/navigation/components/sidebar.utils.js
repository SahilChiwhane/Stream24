export function getInitials(name = "") {
  if (!name || !name.trim()) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function initialsBgColor(name = "") {
  const colors = [
    "#FFC857",
    "#E9724C",
    "#C5283D",
    "#255F85",
    "#2E933C",
    "#41BBD9",
    "#8E44AD",
    "#2C3E50",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function findScrollContainer() {
  const candidates = [
    document.querySelector(".sec-content"),
    document.querySelector("#root"),
    document.querySelector("main"),
    document.querySelector(".app"),
    document.scrollingElement,
  ];
  for (const c of candidates) {
    if (!c) continue;
    if (c === document.scrollingElement) return window;
    const hasScroll =
      c.scrollHeight > c.clientHeight ||
      getComputedStyle(c).overflowY === "auto" ||
      getComputedStyle(c).overflowY === "scroll";
    if (hasScroll) return c;
  }
  return window;
}

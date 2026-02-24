import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

/* small helpers (kept consistent with Sidebar) */
function getInitials(name = "") {
  if (!name || !name.trim()) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function initialsBgColor(name = "") {
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

/**
 * MobileProfilePopover
 *
 * props:
 *  - anchorRect: DOMRect | null
 *  - avatar: string | null
 *  - displayName: string
 *  - onProfile: () => void
 *  - onLogout: () => void
 *  - onClose: () => void
 */
export default function MobileProfilePopover({
  anchorRect = null,
  anchorRef = null, // New prop to ignore clicks on the trigger button
  avatar = null,
  displayName = "Account",
  onProfile = () => {},
  onLogout = () => {},
  onClose = () => {},
}) {
  const root = typeof window !== "undefined" ? document.body : null;
  const popRef = useRef(null);
  const [style, setStyle] = useState({
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "92px",
  });

  useEffect(() => {
    // close on escape
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    // outside clicks fallback (popRef contains the DOM)
    const onDoc = (e) => {
      if (!popRef.current) return;
      // Skip if click is inside popover
      if (popRef.current.contains(e.target)) return;
      // Skip if click is on the anchor button (to avoid double-toggle flicker)
      if (anchorRef?.current?.contains(e.target)) return;

      onClose();
    };
    document.addEventListener("click", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("click", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const popRect = el.getBoundingClientRect();
    const vw = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0,
    );

    if (!anchorRect) {
      setStyle({
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "92px",
      });
      return;
    }

    const gap = 8;
    let top = anchorRect.top - gap - popRect.height;
    let left = anchorRect.left + anchorRect.width / 2 - popRect.width / 2;

    // If top would be off-screen, place below anchor
    if (top < 8) top = anchorRect.bottom + gap;

    // clamp horizontally
    const minLeft = 8;
    const maxLeft = vw - popRect.width - 8;
    left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));

    setStyle({
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      transform: "none",
    });
  }, [anchorRect]);

  if (!root) return null;

  const initials = getInitials(displayName);
  const bg = initialsBgColor(displayName);

  const onHeaderClick = () => {
    try {
      onProfile();
    } finally {
      onClose();
    }
  };

  const node = (
    <div
      ref={popRef}
      role="menu"
      aria-label="Profile menu"
      className="mobile-profile-popup-root"
      style={{
        zIndex: 99999,
        minWidth: 160,
        background: "var(--surface)",
        border: "1px solid var(--card-border)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        borderRadius: 10,
        overflow: "hidden",
        ...style,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header: now clickable to "Manage account" (wired to onProfile) */}
      <button
        type="button"
        onClick={onHeaderClick}
        className="w-full text-left"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            background: avatar ? "transparent" : bg,
            color: avatar ? undefined : "#000",
            fontWeight: 700,
            flex: "0 0 auto",
          }}
          aria-hidden
        >
          {avatar ? (
            <img
              src={avatar}
              alt={displayName}
              style={{ width: 44, height: 44, objectFit: "cover" }}
            />
          ) : initials ? (
            <span style={{ fontSize: 14, lineHeight: 1 }}>{initials}</span>
          ) : (
            <FaUserCircle size={24} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, color: "var(--text)" }}>
            {displayName}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Manage account
          </div>
        </div>
      </button>

      <div
        style={{
          height: 1,
          background: "transparent",
          borderTop: "1px solid var(--card-border)",
        }}
      />

      {/* Only Logout kept */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <button
          type="button"
          onClick={() => {
            try {
              onLogout();
            } finally {
              onClose();
            }
          }}
          className="w-full text-left px-4 py-3 hover:bg-[rgba(255,255,255,0.02)]"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontWeight: 600,
            color: "var(--text)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "var(--card-overlay)",
            }}
          >
            <FiLogOut />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return createPortal(node, root);
}

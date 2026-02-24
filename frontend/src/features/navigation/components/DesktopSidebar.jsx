import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

const DesktopSidebar = ({
  collapsed,
  setCollapsed,
  NAV_ITEMS,
  renderDesktopItem,
  avatar,
  displayName,
  firstName,
  lastName,
  initials,
  bg,
  navigate,
  handleLogout,
  logoutAnimating,
}) => {
  const [hovering, setHovering] = useState(false);

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen flex flex-col z-50 overflow-hidden
        bg-gradient-to-b from-[#0d0d0d] to-[#040404]
        border-r border-white/[0.05] shadow-[10px_0_50px_rgba(0,0,0,0.8)]
        transition-[width] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]
      `}
      style={{ width: "var(--sidebar-current)" }}
      onMouseEnter={() => collapsed && setHovering(true)}
      onMouseLeave={() => collapsed && setHovering(false)}
    >
      {/* Decorative vertical highlight line */}
      <div className="absolute right-0 top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/[0.07] to-transparent pointer-events-none" />
      {/* HEADER */}
      <div
        className={`flex items-center py-6 transition-all duration-300 ${
          collapsed ? "justify-center px-0" : "justify-between px-4"
        }`}
      >
        <div className={`flex items-center ${collapsed ? "gap-0" : "gap-3"}`}>
          <div className="w-12 h-12 relative flex items-center justify-center">
            {/* LOGO */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                collapsed && hovering
                  ? "opacity-0 scale-75 rotate-45 pointer-events-none"
                  : "opacity-100 scale-100 rotate-0"
              }`}
            >
              <div
                className="w-10 h-10 flex items-center justify-center rounded-2xl select-none bg-[#2563EB] transition-transform group-hover:scale-105"
                style={{ color: "#ffffff" }}
              >
                <span className="font-semibold text-sm tracking-tight">
                  S24
                </span>
              </div>
            </div>

            {/* EXPAND BUTTON */}
            <button
              onClick={() => setCollapsed(false)}
              className={`absolute inset-0 m-auto w-10 h-10 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 transform hover:bg-white/10 ${
                collapsed && hovering
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-75 -rotate-45 pointer-events-none"
              }`}
              aria-label="Open sidebar"
            >
              <FaChevronRight className="text-white/70" size={14} />
            </button>
          </div>

          <span
            className="text-white/90 font-bold text-xl tracking-tight select-none
             transition-all duration-300 ease-out overflow-hidden whitespace-nowrap uppercase"
            style={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : "auto",
              transform: collapsed ? "translateX(-12px)" : "translateX(0)",
            }}
          >
            STREAM<span className="text-[#2563EB]">24</span>
          </span>
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all active:scale-95"
            aria-label="Collapse sidebar"
          >
            <FaChevronLeft className="text-white/40" size={12} />
          </button>
        )}
      </div>

      {/* NAV */}
      <nav
        className={`flex-1 flex flex-col gap-2 mt-4 ${
          collapsed ? "px-2" : "px-4"
        }`}
      >
        {NAV_ITEMS.map((item) => renderDesktopItem(item))}
      </nav>

      {/* ACCOUNT */}
      <div className="mt-auto px-4 pb-6 space-y-4">
        <div
          onClick={() => navigate("/account")}
          className={`flex items-center gap-3 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent group shrink-0 ${
            collapsed
              ? "justify-center h-12 w-12 mx-auto px-0"
              : "p-2 justify-start hover:bg-white/[0.04] hover:border-white/5"
          }`}
        >
          <div className="relative shrink-0 flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                loading="lazy"
              />
            ) : initials ? (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-extrabold uppercase ring-1 ring-white/10 shrink-0"
                style={{ background: bg, color: "#000" }}
              >
                {initials}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ring-1 ring-white/10 shrink-0">
                <FaUserCircle className="text-white/20 w-5 h-5" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#080808]" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[15px] font-bold text-white truncate leading-tight tracking-wider">
                {firstName || lastName
                  ? `${firstName} ${lastName}`.trim()
                  : displayName}
              </span>
              <span className="text-[11px] font-bold text-gray-500/60 uppercase tracking-[0.3em] mt-1">
                Premium
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.3em] rounded-xl text-gray-500/80 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 mb-4 ${
              logoutAnimating ? "logout-animating" : ""
            }`}
          >
            <FiLogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default React.memo(DesktopSidebar);

import React from "react";
import { FaUserCircle } from "react-icons/fa";
import MobileProfilePopover from "../../profile/components/MobileProfilePopover";

const MobileBottomNav = ({
  NAV_ITEMS,
  renderMobileItem,
  showMobileNav,
  navigate,
  profileButtonRef,
  toggleProfile,
  closeProfile,
  isMobile,
  mobileProfileOpen,
  anchorRect,
  avatar,
  displayName,
  initials,
  bg,
  handleLogout,
}) => {
  return (
    <>
      {/* Floating Home Button (Sidebar Style) */}
      <button
        onClick={() => {
          if (window.location.pathname !== "/movies") {
            navigate("/movies");
          }
        }}
        className="
          fixed top-5 left-5 z-[9999] 
          flex items-center gap-3
          transition-all duration-500 ease-out
          hover:scale-105 active:scale-95
        "
        style={{
          opacity: showMobileNav ? 1 : 0,
          transform: showMobileNav ? "translateY(0)" : "translateY(-10px)",
        }}
      >
        <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_8px_24px_rgba(37,99,235,0.3)] border border-white/10">
          <span className="font-semibold text-base tracking-tight">S24</span>
        </div>
      </button>

      {/* Bottom Bar: Eclipse Glassmorphism (Deep Obsidian) */}
      <div
        className="
          fixed bottom-6 left-1/2 z-50 
          w-[92%] max-w-[480px]
          backdrop-blur-3xl bg-black/85
          border border-blue-500/10
          rounded-[2.2rem] px-3 py-2
          flex justify-around items-center
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]
        "
        style={{
          transform: showMobileNav
            ? "translate(-50%, 0)"
            : "translate(-50%, 140%)",
          opacity: showMobileNav ? 1 : 0,
          pointerEvents: showMobileNav ? "auto" : "none",
          transition: "all 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Subtle inner highlight blue glow */}
        <div className="absolute inset-x-12 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />

        {NAV_ITEMS.slice(0, 3).map((it) => (
          <div key={it.key} className="flex-1 flex justify-center">
            {renderMobileItem(it)}
          </div>
        ))}

        <div className="flex-1 flex justify-center">
          {renderMobileItem(NAV_ITEMS.find((i) => i.key === "search"))}
        </div>

        <div className="flex-1 flex justify-center">
          {renderMobileItem(NAV_ITEMS.find((i) => i.key === "wishlist"))}
        </div>

        {/* PROFILE: Circular Blue Wrapper */}
        <div className="flex-1 flex justify-center relative">
          <button
            ref={profileButtonRef}
            onClick={toggleProfile}
            onMouseDown={(e) => e.stopPropagation()}
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center 
              transition-all duration-300 border-2
              ${mobileProfileOpen ? "border-blue-600 scale-110 shadow-[0_0_20px_rgba(37,99,235,0.4)]" : "border-white/5"}
            `}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : initials ? (
              <div
                className="w-full h-full rounded-xl flex items-center justify-center font-black text-[10px] tracking-tighter"
                style={{ background: bg, color: "#000" }}
              >
                {initials}
              </div>
            ) : (
              <FaUserCircle size={24} className="text-white/60" />
            )}
          </button>

          {isMobile && mobileProfileOpen && (
            <MobileProfilePopover
              anchorRect={anchorRect}
              anchorRef={profileButtonRef}
              avatar={avatar}
              displayName={displayName}
              onClose={closeProfile}
              onProfile={() => {
                closeProfile();
                navigate("/account");
              }}
              onLogout={() => {
                closeProfile();
                handleLogout();
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(MobileBottomNav);

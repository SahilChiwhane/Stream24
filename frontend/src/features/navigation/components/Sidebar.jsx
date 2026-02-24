// import React, {
//   useEffect,
//   useRef,
//   useState,
//   useMemo,
//   useCallback,
//   lazy,
//   Suspense,
// } from "react";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { useWishlistCount } from "../../wishlist/hooks/useWishlistCount";
// import { useAuth } from "../../auth/context/AuthContext";
// import { NAV_ITEMS, LOCAL_USER_KEY } from "./sidebar.constants";
// import {
//   getInitials,
//   initialsBgColor,
//   findScrollContainer,
// } from "./sidebar.utils";
// import useSidebarLayout from "../hooks/useSidebarLayout";

// const DesktopSidebar = lazy(() => import("./DesktopSidebar"));
// const MobileBottomNav = lazy(() => import("./MobileBottomNav"));
// const DesktopSidebarSkeleton = lazy(() => import("./DesktopSidebarSkeleton"));

// const STORAGE_KEY = "sidebar:collapsed";

// const Sidebar = () => {
//   const { isMobile, collapsed, setCollapsed } = useSidebarLayout();

//   const navigate = useNavigate();
//   const location = useLocation();
//   const auth = useAuth();
//   const count = useWishlistCount();

//   const [showMobileNav, setShowMobileNav] = useState(true);
//   const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

//   const profileButtonRef = useRef(null);
//   const [anchorRect, setAnchorRect] = useState(null);
//   const lastScrollPos = useRef(0);

//   /* ---------------------------
//      Persist collapsed state
//   --------------------------- */
//   useEffect(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved === "true") setCollapsed(true);
//     if (saved === "false") setCollapsed(false);
//   }, [setCollapsed]);

//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, String(collapsed));
//   }, [collapsed]);

//   /* ---------------------------
//      User identity
//   --------------------------- */
//   const user = auth?.user ?? null;

//   const [localName] = useState(() => {
//     try {
//       const raw = localStorage.getItem(LOCAL_USER_KEY);
//       return raw ? (JSON.parse(raw)?.name ?? "") : "";
//     } catch {
//       return "";
//     }
//   });

//   const displayName = useMemo(
//     () => user?.name?.trim() || localName || "Account",
//     [user?.name, localName],
//   );

//   const avatar = user?.avatar ?? user?.avatarUrl ?? null;
//   const initials = useMemo(() => getInitials(displayName), [displayName]);
//   const bg = useMemo(() => initialsBgColor(displayName), [displayName]);

//   /* ---------------------------
//      Routing helpers
//   --------------------------- */
//   const isRouteActive = useCallback(
//     (to) =>
//       !!to &&
//       (location.pathname === to || location.pathname.startsWith(`${to}/`)),
//     [location.pathname],
//   );

//   /* ---------------------------
//      Scroll behavior for mobile
//   --------------------------- */
//   useEffect(() => {
//     if (!isMobile) return;

//     const scrollContainer = findScrollContainer();

//     const getPos = () =>
//       scrollContainer === window
//         ? window.pageYOffset || document.documentElement.scrollTop || 0
//         : scrollContainer.scrollTop || 0;

//     lastScrollPos.current = getPos();

//     const onScroll = () => {
//       const current = getPos();
//       const delta = current - lastScrollPos.current;
//       if (delta > 0) setShowMobileNav(false);
//       else if (delta < 0) setShowMobileNav(true);
//       lastScrollPos.current = current;
//     };

//     scrollContainer.addEventListener("scroll", onScroll, { passive: true });

//     return () => {
//       scrollContainer.removeEventListener("scroll", onScroll);
//     };
//   }, [isMobile]);

//   /* ---------------------------
//      Navigation
//   --------------------------- */
//   const onNavClick = useCallback(
//     (item) => {
//       if (item.to) navigate(item.to);
//       setMobileProfileOpen(false);
//     },
//     [navigate],
//   );

//   /* ---------------------------
//      Logout
//   --------------------------- */
//   const [logoutAnimating, setLogoutAnimating] = useState(false);

//   const handleLogout = useCallback(async () => {
//     if (logoutAnimating) return;
//     setLogoutAnimating(true);

//     setTimeout(async () => {
//       try {
//         if (auth?.logout) await auth.logout();
//         else if (auth?.signOut) await auth.signOut();
//       } finally {
//         navigate("/login");
//         setLogoutAnimating(false);
//       }
//     }, 420);
//   }, [auth, navigate, logoutAnimating]);

//   /* ---------------------------
//      Renderers
//   --------------------------- */
//   const renderDesktopItem = useCallback(
//   (item) => {
//     const active = isRouteActive(item.to);

//     return (
//       <Link
//         key={item.key}
//         to={item.to}
//         aria-current={active ? "page" : undefined}
//         className={`group flex items-center gap-3 px-4 py-3 transition-colors duration-200
//           ${collapsed ? "justify-center" : ""}
//           ${active ? "bg-white/5" : "hover:bg-white/5"}
//         `}
//       >
//         <span
//           className="sidebar--icon"
//           style={{
//             color: active ? "var(--text)" : undefined,
//             opacity: active ? 1 : undefined,
//           }}
//         >
//           {item.icon}
//         </span>

//         <span
//           className="sidebar--Font transition-all duration-300 ease-out whitespace-nowrap overflow-hidden"
//           style={{
//             opacity: collapsed ? 0 : 1,
//             transform: collapsed ? "translateX(-6px)" : "translateX(0)",
//             width: collapsed ? 0 : "auto",
//             fontWeight: active ? 600 : undefined,
//             color: active ? "var(--text)" : undefined,
//           }}
//         >
//           {item.label}
//         </span>
//       </Link>
//     );
//   },
//   [collapsed, isRouteActive],
// );

//   const renderMobileItem = useCallback(
//     (item) => (
//       <button
//         key={item.key}
//         onClick={() => onNavClick(item)}
//         className="flex flex-col items-center justify-center"
//       >
//         {item.icon}
//       </button>
//     ),
//     [onNavClick],
//   );

//   const closeProfile = useCallback(() => {
//     setMobileProfileOpen(false);
//     setAnchorRect(null);
//   }, []);

//   const toggleProfile = useCallback((e) => {
//     e.stopPropagation();
//     setMobileProfileOpen((prev) => {
//       if (prev) {
//         setAnchorRect(null);
//         return false;
//       }
//       const rect = profileButtonRef.current?.getBoundingClientRect() ?? null;
//       setAnchorRect(rect);
//       return true;
//     });
//   }, []);

//   /* ---------------------------
//      Render
//   --------------------------- */
//   return (
//     <>
//       {!isMobile && (
//         <Suspense fallback={<DesktopSidebarSkeleton collapsed={collapsed} />}>
//           <DesktopSidebar
//             collapsed={collapsed}
//             setCollapsed={setCollapsed}
//             NAV_ITEMS={NAV_ITEMS}
//             renderDesktopItem={renderDesktopItem}
//             avatar={avatar}
//             displayName={displayName}
//             initials={initials}
//             bg={bg}
//             navigate={navigate}
//             handleLogout={handleLogout}
//             logoutAnimating={logoutAnimating}
//           />
//         </Suspense>
//       )}

//       {isMobile && (
//         <Suspense fallback={null}>
//           <MobileBottomNav
//             NAV_ITEMS={NAV_ITEMS}
//             renderMobileItem={renderMobileItem}
//             showMobileNav={showMobileNav}
//             navigate={navigate}
//             profileButtonRef={profileButtonRef}
//             toggleProfile={toggleProfile}
//             closeProfile={closeProfile}
//             isMobile={isMobile}
//             mobileProfileOpen={mobileProfileOpen}
//             anchorRect={anchorRect}
//             avatar={avatar}
//             displayName={displayName}
//             initials={initials}
//             bg={bg}
//             handleLogout={handleLogout}
//           />
//         </Suspense>
//       )}
//     </>
//   );
// };

// export default React.memo(Sidebar);

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWishlist } from "../../wishlist/context/WishlistContext";
import { useAuth } from "../../auth/context/AuthContext";
import { NAV_ITEMS, LOCAL_USER_KEY } from "./sidebar.constants";
import {
  getInitials,
  initialsBgColor,
  findScrollContainer,
} from "./sidebar.utils";
import useSidebarLayout from "../hooks/useSidebarLayout";
import ConfirmDialog from "../../../shared/components/ConfirmDialog";

const DesktopSidebar = lazy(() => import("./DesktopSidebar"));
const MobileBottomNav = lazy(() => import("./MobileBottomNav"));
const DesktopSidebarSkeleton = lazy(() => import("./DesktopSidebarSkeleton"));

const STORAGE_KEY = "sidebar:collapsed";

const Sidebar = () => {
  const { isMobile, collapsed, setCollapsed } = useSidebarLayout();

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // useWishlistCount(); // removed
  const { count } = useWishlist();

  const [showMobileNav, setShowMobileNav] = useState(true);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const profileButtonRef = useRef(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const lastScrollPos = useRef(0);

  /* ---------------------------
     Persist collapsed state
  --------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "true") setCollapsed(true);
    if (saved === "false") setCollapsed(false);
  }, [setCollapsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  /* ---------------------------
     User identity
  --------------------------- */
  const user = auth?.user ?? null;

  const [localName] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_USER_KEY);
      return raw ? (JSON.parse(raw)?.name ?? "") : "";
    } catch {
      return "";
    }
  });

  const displayName = useMemo(() => {
    if (user?.firstName || user?.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user?.name?.trim() || localName || "Account";
  }, [user?.firstName, user?.lastName, user?.name, localName]);

  const avatar = user?.avatar ?? user?.avatarUrl ?? null;
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const bg = useMemo(() => initialsBgColor(displayName), [displayName]);

  /* ---------------------------
     Routing helpers
  --------------------------- */
  const isRouteActive = useCallback(
    (to) =>
      !!to &&
      (location.pathname === to || location.pathname.startsWith(`${to}/`)),
    [location.pathname],
  );

  /* ---------------------------
     Scroll & Tap behavior (mobile)
  --------------------------- */
  useEffect(() => {
    if (!isMobile) return;

    // 1. Scroll Logic
    const scrollContainer = window; // Simplify to window for mobile global scroller

    const getPos = () =>
      window.pageYOffset || document.documentElement.scrollTop || 0;

    lastScrollPos.current = getPos();

    const onScroll = () => {
      const current = getPos();
      const delta = current - lastScrollPos.current;

      if (Math.abs(delta) < 10) return;

      if (delta > 0 && current > 50) setShowMobileNav(false);
      else if (delta < 0) setShowMobileNav(true);

      lastScrollPos.current = current;
    };

    // 2. Tap to Toggle Logic
    const onGlobalClick = (e) => {
      // Don't toggle if clicking a link/button/interactive element
      const isInteractive = e.target.closest(
        'button, a, select, input, [role="button"]',
      );
      if (isInteractive) return;

      setShowMobileNav((prev) => !prev);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onGlobalClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onGlobalClick);
    };
  }, [isMobile]);

  /* ---------------------------
     Navigation
  --------------------------- */
  const onNavClick = useCallback(
    (item) => {
      // Prevent redundant history entries if already on this route
      if (item.to && location.pathname !== item.to) {
        navigate(item.to);
      }
      setMobileProfileOpen(false);
    },
    [navigate, location.pathname],
  );

  /* ---------------------------
     Logout
  --------------------------- */
  const [logoutAnimating, setLogoutAnimating] = useState(false);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    if (logoutAnimating) return;
    setLogoutAnimating(true);

    setTimeout(async () => {
      try {
        if (auth?.logout) await auth.logout();
        else if (auth?.signOut) await auth.signOut();
      } finally {
        navigate("/login");
        setLogoutAnimating(false);
      }
    }, 420);
  }, [auth, navigate, logoutAnimating]);

  /* ---------------------------
     Renderers
  --------------------------- */
  /* ---------------------------
     Renderers
  --------------------------- */
  const renderDesktopItem = useCallback(
    (item) => {
      const active = isRouteActive(item.to);
      const isWishlist = item.key === "wishlist";

      return (
        <Link
          key={item.key}
          to={item.to}
          aria-current={active ? "page" : undefined}
          onClick={(e) => {
            if (active) e.preventDefault();
          }}
          className={`
            relative group/item flex items-center transition-all duration-300 shrink-0
            ${collapsed ? "justify-center h-12 w-12 mx-auto rounded-xl" : "px-4 py-3.5 rounded-2xl gap-4"}
            ${active ? "bg-white/[0.08] text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.02]"}
          `}
        >
          <span
            className={`
              transition-all duration-300 flex items-center justify-center shrink-0
              ${active ? "text-white" : "group-hover/item:text-gray-200"}
              w-5 h-5
              relative
            `}
          >
            {React.cloneElement(item.icon, { size: 18 })}

            {/* Collapsed Badge */}
            {collapsed && isWishlist && count > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border border-[#0f0f0f]">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </span>

          {!collapsed && (
            <>
              <span
                className={`
                  text-[15px] font-medium tracking-wider transition-all duration-300
                  ${active ? "text-white" : "text-gray-500 group-hover/item:text-gray-200"}
                `}
              >
                {item.label}
              </span>

              {isWishlist && count > 0 && (
                <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </>
          )}
        </Link>
      );
    },
    [collapsed, isRouteActive, count],
  );

  const renderMobileItem = useCallback(
    (item) => {
      if (!item) return null;
      const active = isRouteActive(item.to);
      const isWishlist = item.key === "wishlist";

      return (
        <button
          key={item.key}
          onClick={() => onNavClick(item)}
          className={`
            relative flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-300
            ${active ? "bg-blue-600/10 text-blue-500 scale-105" : "text-white/40 active:scale-95"}
          `}
        >
          <div className="relative">
            {React.cloneElement(item.icon, {
              size: 20,
              className: `transition-all duration-300 ${active ? "drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]" : ""}`,
            })}

            {isWishlist && count > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] border border-black">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </div>

          <div
            className={`
              absolute -bottom-1 w-1.5 h-[3px] rounded-full bg-blue-500 transition-all duration-500
              ${active ? "opacity-100 scale-x-125" : "opacity-0 scale-x-0"}
            `}
          />
        </button>
      );
    },
    [onNavClick, isRouteActive, count],
  );

  const closeProfile = useCallback(() => {
    setMobileProfileOpen(false);
    setAnchorRect(null);
  }, []);

  const toggleProfile = useCallback((e) => {
    e.stopPropagation();
    setMobileProfileOpen((prev) => {
      if (prev) {
        setAnchorRect(null);
        return false;
      }

      const rect = profileButtonRef.current?.getBoundingClientRect() ?? null;
      setAnchorRect(rect);
      return true;
    });
  }, []);

  /* ---------------------------
     Render
  --------------------------- */
  return (
    <>
      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout from Stream24?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmStyle="danger"
      />

      {!isMobile && (
        <Suspense fallback={<DesktopSidebarSkeleton collapsed={collapsed} />}>
          <DesktopSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            NAV_ITEMS={NAV_ITEMS}
            renderDesktopItem={renderDesktopItem}
            avatar={avatar}
            displayName={displayName}
            firstName={user?.firstName || ""}
            lastName={user?.lastName || ""}
            initials={initials}
            bg={bg}
            navigate={navigate}
            handleLogout={handleLogoutClick}
            logoutAnimating={logoutAnimating}
          />
        </Suspense>
      )}

      {isMobile && (
        <Suspense fallback={null}>
          <MobileBottomNav
            NAV_ITEMS={NAV_ITEMS}
            renderMobileItem={renderMobileItem}
            showMobileNav={showMobileNav}
            navigate={navigate}
            profileButtonRef={profileButtonRef}
            toggleProfile={toggleProfile}
            closeProfile={closeProfile}
            isMobile={isMobile}
            mobileProfileOpen={mobileProfileOpen}
            anchorRect={anchorRect}
            avatar={avatar}
            displayName={displayName}
            initials={initials}
            bg={bg}
            handleLogout={handleLogoutClick}
          />
        </Suspense>
      )}
    </>
  );
};

export default React.memo(Sidebar);

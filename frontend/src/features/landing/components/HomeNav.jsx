import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

const HomeNav = () => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollTopRef = useRef(0);
  const location = useLocation();
  const { user } = useAuth();

  // On the login page, offer Sign Up instead (don't link to where you already are)
  const onLoginPage = location.pathname === "/login";

  useEffect(() => {
    const handleScroll = () => {
      const cur = window.pageYOffset || 0;
      if (cur > lastScrollTopRef.current && cur > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollTopRef.current = Math.max(cur, 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full flex items-center justify-between px-5 sm:px-12 md:px-14 py-5 font-sans">
        {/* Logo */}
        <Link
          to={user ? "/movies" : "/"}
          className="flex items-center gap-2.5 select-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center">
            <span className="text-white font-black text-sm tracking-wide">
              S24
            </span>
          </div>
          <span
            className="hidden sm:block font-bold text-white text-lg tracking-tight"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
          >
            STREAM<span className="text-blue-500">24</span>
          </span>
        </Link>

        {/* CTA — Handle Authenticated State */}
        <Link
          to={user ? "/movies" : onLoginPage ? "/signup" : "/login"}
          className="
            px-5 py-2 rounded-xl text-sm font-black tracking-wide text-white/90
            bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-600/10
            transition-all duration-300 shadow-xl shadow-black/20
          "
        >
          {user ? "Browse Content" : onLoginPage ? "Sign Up" : "Sign In"}
        </Link>
      </div>
    </nav>
  );
};

export default HomeNav;

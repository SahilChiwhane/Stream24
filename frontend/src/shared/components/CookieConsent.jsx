import React, { useState, useEffect } from "react";
import { FiInfo, FiX } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const STORAGE_KEY = "stream24:cookie_consent";

  useEffect(() => {
    // Industrial Rule: Do not bother authenticated users or disrupt playback
    const isPlayerPage = location.pathname.includes("/watch/");
    if (user || isPlayerPage) {
      setIsVisible(false);
      return;
    }

    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000); // Slightly longer delay for premium feel
      return () => clearTimeout(timer);
    }
  }, [user, location.pathname]);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-6 z-[9999] max-w-[420px] md:max-w-[380px] w-[92%] font-sans animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden group">
        {/* Visual Polish - Subtle Gradient */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <FiInfo className="text-blue-500 text-lg" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                Cookie Policy
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-white/20 hover:text-white transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>

            <p className="text-gray-400 text-[11px] leading-relaxed font-medium mb-5">
              We use cookies to enhance your streaming experience, analyze site
              traffic, and serve high-fidelity cinematic content tailored for
              you.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleAccept}
                className="flex-grow bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-[13px] active:scale-95"
              >
                Accept All
              </button>
              <button
                onClick={handleDecline}
                className="flex-grow sm:flex-none px-6 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-300 text-[13px] border border-white/5"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>

        {/* Corner Decor */}
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-500/5 blur-2xl rounded-full" />
      </div>
    </div>
  );
};

export default CookieConsent;

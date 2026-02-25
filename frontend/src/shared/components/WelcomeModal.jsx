import React, { useState, useEffect } from "react";
import { FiShield, FiInfo, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";

const WelcomeModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const STORAGE_KEY = "stream24:welcome_consent";

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Small delay for perceived performance/premium feel
      const timer = setTimeout(() => {
        setIsVisible(true);
        document.body.style.overflow = "hidden";
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setIsVisible(false);
    document.body.style.overflow = "unset";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_25px_100px_rgba(0,0,0,0.9)] my-auto">
        <div className="p-6 sm:p-12 max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center flex-shrink-0">
              <FiShield className="text-blue-500 text-xl sm:text-2xl" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
                Welcome to <span className="text-blue-500">Stream24</span>
              </h2>
              <p className="text-[9px] sm:text-[10px] font-medium text-gray-500 uppercase tracking-[0.25em] mt-1">
                Portfolio Project & Industry Demo
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-4 sm:space-y-6 text-gray-400 text-sm leading-relaxed">
            <p className="text-white/80 font-normal">
              Stream24 is a personal portfolio project built for learning and
              demonstration purposes by{" "}
              <span className="text-blue-400 font-medium">Sahil Chiwhane</span>.
            </p>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-4">
                <FiInfo className="text-blue-500 flex-shrink-0 mt-1" />
                <p className="font-normal">
                  This platform uses <span className="text-white/90">TMDB</span>{" "}
                  and <span className="text-white/90">YouTube</span> APIs to
                  fetch metadata and trailers. Stream24 is not affiliated with
                  or endorsed by TMDB, YouTube, or any production studios.
                </p>
              </div>

              <div className="flex gap-4">
                <FiShield className="text-blue-500 flex-shrink-0 mt-1" />
                <p className="font-normal">
                  This site uses cookies / localStorage to improve user
                  experience. We do not host or stream copyrighted video content
                  directly.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic pb-2 border-b border-white/5 font-normal">
              Monetization features (Test Mode) are implemented only to
              demonstrate technical capability in a full-stack environment.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleAccept}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3.5 px-8 rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95 text-xs sm:text-sm tracking-widest uppercase"
            >
              Accept & Continue
            </button>
            <Link
              to="/about"
              onClick={handleAccept}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors py-3.5 px-6 text-[10px] sm:text-xs font-medium uppercase tracking-widest"
            >
              About / Contact <FiExternalLink />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

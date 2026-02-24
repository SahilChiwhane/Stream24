import React from "react";

const Loader = ({ fullPage = true }) => {
  return (
    <div
      className={`flex flex-col justify-center items-center ${
        fullPage
          ? "h-screen w-full fixed inset-0 z-[9999] bg-black"
          : "py-20 w-full"
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Minimalist Zigzag Snake Path around S24 */}
        <svg className="w-20 h-20 animate-spin-custom" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <path
            d="M 50,10 A 40,40 0 1,1 49.9,10"
            fill="none"
            stroke="url(#snakeGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 160"
          />
          {/* Subtle glow path */}
          <path
            d="M 50,10 A 40,40 0 1,1 49.9,10"
            fill="none"
            stroke="#2563EB"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="5 200"
            className="opacity-40"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black tracking-tighter text-white opacity-90">
            S24
          </span>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes spin-custom {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-custom {
          animation: spin-custom 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default Loader;

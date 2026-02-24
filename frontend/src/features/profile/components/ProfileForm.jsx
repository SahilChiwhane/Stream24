import React, { useEffect, useRef, useState } from "react";
import { FaUser, FaUserTag, FaEnvelope, FaCheckCircle } from "react-icons/fa";

export default function ProfileForm({
  savedName,
  firstName,
  setFirstName,
  lastName,
  setLastName,

  email,
  statusMessage,
  setStatusMessage,
  fieldErrors = {},
  bare = false,
}) {
  const [showToast, setShowToast] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!statusMessage) return;

    if (timer.current) clearTimeout(timer.current);

    setShowToast(true);

    timer.current = setTimeout(() => {
      setShowToast(false);
      setStatusMessage("");
    }, 3000);

    return () => clearTimeout(timer.current);
  }, [statusMessage, setStatusMessage]);

  return (
    <>
      {/* Premium Toast */}
      {showToast && (
        <div
          className="
          fixed top-6 left-1/2 -translate-x-1/2 z-[9999]
          flex items-center gap-3 px-6 py-3 rounded-2xl
          bg-[#0a0a0a]/90 backdrop-blur-xl border border-blue-600/30
          shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(37,99,235,0.15)]
          animate-in fade-in slide-in-from-top-4 duration-300
        "
        >
          <FaCheckCircle className="text-blue-500 w-4 h-4" />
          <span className="text-sm font-semibold text-white tracking-wide">
            {statusMessage}
          </span>
        </div>
      )}

      {bare ? (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name Fields Row */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 ml-1">
                  First Name
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="h-4 w-4 text-gray-600 group-focus-within/input:text-blue-600 transition-colors" />
                  </div>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First"
                    className="
                      w-full pl-12 pr-4 py-4 rounded-2xl
                      bg-white/[0.03] border border-white/5
                      text-white text-base font-medium placeholder:text-gray-700
                      focus:bg-white/[0.06] focus:border-blue-600/40
                      outline-none transition-all duration-300 shadow-xl
                    "
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 ml-1">
                  Last Name
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaUser className="h-4 w-4 text-gray-600 group-focus-within/input:text-blue-600 transition-colors" />
                  </div>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last"
                    className="
                      w-full pl-12 pr-4 py-4 rounded-2xl
                      bg-white/[0.03] border border-white/5
                      text-white text-base font-medium placeholder:text-gray-700
                      focus:bg-white/[0.06] focus:border-blue-600/40
                      outline-none transition-all duration-300 shadow-xl
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Field (Readonly) */}
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 ml-1">
              Email Address
            </label>
            <div className="relative opacity-60">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="h-4 w-4 text-gray-600" />
              </div>
              <input
                type="email"
                value={email}
                readOnly
                className="
                  w-full pl-12 pr-4 py-4 rounded-2xl
                  bg-white/[0.02] border border-white/5
                  text-gray-400 text-base font-medium cursor-not-allowed
                "
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="mb-10 text-left">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                Hello,{" "}
                <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  {savedName || "Member"}
                </span>
              </h1>
              <p className="text-gray-500 font-medium">
                Manage your profile information and account settings.
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name Fields Row */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                      First Name
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="h-4 w-4 text-gray-600 group-focus-within/input:text-blue-600 transition-colors" />
                      </div>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First"
                        className="
                          w-full pl-11 pr-4 py-4 rounded-2xl
                          bg-white/[0.03] border border-white/10
                          text-white font-medium placeholder:text-gray-700
                          focus:bg-white/[0.05] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10
                          outline-none transition-all duration-300
                        "
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                      Last Name
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="h-4 w-4 text-gray-600 group-focus-within/input:text-blue-600 transition-colors" />
                      </div>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last"
                        className="
                          w-full pl-11 pr-4 py-4 rounded-2xl
                          bg-white/[0.03] border border-white/10
                          text-white font-medium placeholder:text-gray-700
                          focus:bg-white/[0.05] focus:border-blue-600/50 focus:ring-4 focus:ring-blue-600/10
                          outline-none transition-all duration-300
                        "
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Email - removed logic, just rendering as it was before but cleaner */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Email Address
                </label>
                <div className="relative opacity-60">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-600" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="
                      w-full pl-11 pr-4 py-4 rounded-2xl
                      bg-white/5 border border-white/5
                      text-gray-400 font-medium cursor-not-allowed
                    "
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

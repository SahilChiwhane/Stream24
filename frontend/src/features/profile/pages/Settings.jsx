// import React, { useEffect, useRef, useState } from "react";
// import { getPreferences, updatePreferences } from "../services/preferences.service";

// function Switch({ checked, onChange, id, label, disabled }) {
//   return (
//     <div className="flex items-center gap-3 opacity-100">
//       <button
//         id={id}
//         role="switch"
//         aria-checked={checked}
//         disabled={disabled}
//         onClick={() => !disabled && onChange(!checked)}
//         onKeyDown={(e) => {
//           if (disabled) return;
//           if (e.key === "Enter" || e.key === " ") {
//             e.preventDefault();
//             onChange(!checked);
//           }
//         }}
//         className={`
//           relative inline-flex items-center h-6 w-11 rounded-full
//           transition-colors duration-200
//           focus:outline-none focus:ring-2 focus:ring-[#60a5fa]/60
//           ${checked ? "bg-[#60a5fa]" : "bg-gray-700"}
//           ${disabled ? "opacity-40 cursor-not-allowed" : ""}
//         `}
//       >
//         <span
//           className={`
//             inline-block w-4 h-4 bg-white rounded-full
//             transform transition-transform duration-200
//             ${checked ? "translate-x-5" : "translate-x-1"}
//           `}
//         />
//       </button>

//       {label && (
//         <label htmlFor={id} className="select-none text-sm text-gray-300">
//           {label}
//         </label>
//       )}
//     </div>
//   );
// }

// export default function Settings() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [settings, setSettings] = useState({
//     autoplayPreview: true,
//     previewMuted: true,
//   });

//   const [toastMessage, setToastMessage] = useState("");
//   const toastTimeoutRef = useRef(null);

//   const showToast = (msg) => {
//     setToastMessage(msg);

//     if (toastTimeoutRef.current) {
//       clearTimeout(toastTimeoutRef.current);
//     }

//     toastTimeoutRef.current = setTimeout(() => {
//       setToastMessage("");
//       toastTimeoutRef.current = null;
//     }, 1800);
//   };

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       try {
//         const prefs = await getPreferences();
//         if (mounted && prefs) setSettings(prefs);
//       } catch (e) {
//         console.error("Failed to load preferences", e);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     load();
//     return () => (mounted = false);
//   }, []);

//   const update = async (patch, message) => {
//     try {
//       setSaving(true);

//       setSettings((prev) => ({ ...prev, ...patch })); // optimistic UI
//       await updatePreferences(patch);

//       showToast(message);
//     } catch (e) {
//       console.error("Failed to update preferences", e);
//       showToast("Failed to save changes");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const toggleAutoplay = () => {
//     const next = !settings.autoplayPreview;
//     update(
//       { autoplayPreview: next },
//       `Autoplay previews — ${next ? "On" : "Off"}`
//     );
//   };

//   const toggleMuted = () => {
//     const next = !settings.previewMuted;
//     update(
//       { previewMuted: next },
//       `Preview audio — ${next ? "Muted" : "Unmuted"}`
//     );
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         Loading settings…
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white p-6">
//       <div
//         className="
//           max-w-3xl mx-auto
//           bg-black/60 backdrop-blur-md
//           border border-white/10
//           rounded-2xl
//           p-6 md:p-8
//           shadow-[0_20px_60px_rgba(0,0,0,0.7)]
//         "
//       >
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
//             <span className="text-white">Set</span>
//             <span className="text-[#60a5fa]">tings</span>
//           </h1>

//           <p className="text-sm text-gray-400 mt-2">
//             Control how Stream24 behaves for you.
//           </p>
//         </div>

//         {/* Playback */}
//         <section className="mb-10">
//           <h2 className="text-lg font-semibold mb-4 text-white">Playback</h2>

//           <div className="space-y-6">
//             <div>
//               <Switch
//                 id="autoplayPreview"
//                 checked={!!settings.autoplayPreview}
//                 onChange={toggleAutoplay}
//                 disabled={saving}
//                 label="Autoplay previews on title pages"
//               />
//               <p className="text-sm text-gray-400 mt-2 ml-[3.5rem] max-w-lg">
//                 Automatically play teaser or trailer when you open a movie or
//                 show page.
//               </p>
//             </div>

//             <div>
//               <Switch
//                 id="previewMuted"
//                 checked={!!settings.previewMuted}
//                 onChange={toggleMuted}
//                 disabled={saving}
//                 label="Mute previews by default"
//               />
//               <p className="text-sm text-gray-400 mt-2 ml-[3.5rem] max-w-lg">
//                 Previews start muted. You can unmute anytime from the player.
//               </p>
//             </div>
//           </div>
//         </section>

//         <div className="text-xs text-gray-500">
//           Settings are linked to your account.
//         </div>
//       </div>

//       {/* Toast */}
//       <div
//         aria-live="polite"
//         role="status"
//         className="pointer-events-none fixed inset-0 flex items-end justify-end p-6"
//       >
//         <div
//           className={`
//             max-w-xs w-full transition-all duration-200
//             ${toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
//           `}
//         >
//           <div
//             className="
//               bg-black/80 backdrop-blur-lg
//               border border-[#60a5fa]/40
//               px-4 py-2 rounded-xl
//               shadow-[0_0_0_1px_rgba(37,99,235,0.25),0_20px_50px_rgba(37,99,235,0.35)]
//             "
//           >
//             <div className="text-sm font-semibold text-white">
//               {toastMessage}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }































import React, { useRef, useState } from "react";
import { usePreferences } from "../context/PreferencesContext";

function Switch({ checked, onChange, id, label, disabled }) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className={`
          relative inline-flex items-center h-6 w-11 rounded-full
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-600/60
          ${checked ? "bg-blue-600" : "bg-gray-700"}
          ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        `}
      >
        <span
          className={`
            inline-block w-4 h-4 bg-white rounded-full
            transform transition-transform duration-200
            ${checked ? "translate-x-5" : "translate-x-1"}
          `}
        />
      </button>

      {label && (
        <label htmlFor={id} className="select-none text-sm text-gray-300">
          {label}
        </label>
      )}
    </div>
  );
}

export default function Settings() {
  const { prefs, loading, update: updatePref } = usePreferences();
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimeoutRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage("");
      toastTimeoutRef.current = null;
    }, 2000);
  };

  const handleToggle = async (key, label) => {
    try {
      setSaving(true);
      const nextVal = !prefs?.playback?.[key];
      
      // Update global context
      await updatePref({ 
        playback: { 
          ...prefs?.playback, 
          [key]: nextVal 
        } 
      });

      showToast(`${label} — ${nextVal ? "On" : "Off"}`);
    } catch (e) {
      console.error(`Toggle ${key} failed`, e);
      showToast("Failed to save setting");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Syncing settings…</span>
        </div>
      </div>
    );
  }

  // Industrial settings defaults if prefs not loaded yet
  const playback = prefs?.playback || { autoplayPreview: true, previewMuted: true };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div
        className="
          max-w-3xl mx-auto
          bg-stone-900/40 backdrop-blur-xl
          border border-white/5
          rounded-3xl
          p-8 md:p-12
          shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]
        "
      >
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Set<span className="text-blue-600">tings</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Manage your viewing experience and account preferences.
          </p>
        </div>

        {/* Playback Section */}
        <section className="space-y-10">
          <div className="pb-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Playback
            </h2>

            <div className="space-y-10">
              <div className="group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-blue-500 transition-colors">
                      Autoplay previews
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                      Automatically play trailers and teasers as you browse through titles.
                    </p>
                  </div>
                  <Switch
                    id="autoplay"
                    checked={!!playback.autoplayPreview}
                    onChange={() => handleToggle("autoplayPreview", "Autoplay")}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-blue-500 transition-colors">
                      Preview Audio
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                      Start previews with sound off. You can always unmute while watching.
                    </p>
                  </div>
                  <Switch
                    id="muted"
                    checked={!!playback.previewMuted}
                    onChange={() => handleToggle("previewMuted", "Preview Muted")}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Future sections like Subtitles, Quality can go here */}
        </section>

        <div className="mt-12 pt-8 flex items-center justify-between text-xs text-gray-600 border-t border-white/5">
          <span>Settings are synced across all your devices.</span>
          <span className="uppercase tracking-widest font-bold text-[10px]">Stream24 Premium</span>
        </div>
      </div>

      {/* Industrial Toast */}
      <div
        aria-live="polite"
        className={`
          fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out
          ${toastMessage ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-90"}
        `}
      >
        <div className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 ring-4 ring-black/50">
           {toastMessage}
        </div>
      </div>
    </div>
  );
}

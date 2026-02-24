import React, { useState } from "react";
import { AVATARS } from "../config/avatars";

export default function AvatarPicker({ current, onSelect, onClose }) {
  const [selected, setSelected] = useState(current);
  const [saving, setSaving] = useState(false);

  const handleUseAvatar = async () => {
    if (saving) return;
    setSaving(true);

    const avatar = AVATARS.find((a) => a.id === selected);
    if (!avatar) return;

    await onSelect(avatar); // persist profile update
    onClose(); // close immediately after save
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay background */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm sm:max-w-2xl rounded-2xl bg-black/85 border border-white/10 shadow-2xl p-4 sm:p-6 z-10">
        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5">
          Choose Profile Avatar
        </h2>

        {/* RESPONSIVE GRID */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a.id)}
              className={`w-full aspect-square rounded-xl overflow-hidden border flex items-center justify-center transition
                ${
                  selected === a.id
                    ? "border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.6)] scale-[1.04]"
                    : "border-white/20 hover:border-white/40"
                }`}
            >
              <img
                src={a.url}
                alt={a.label}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-4 sm:mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition text-sm sm:text-base"
          >
            Cancel
          </button>

          <button
            onClick={handleUseAvatar}
            disabled={saving}
            className={`px-5 py-2 rounded-lg font-semibold transition text-sm sm:text-base
              ${
                saving
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
          >
            {saving ? "Saving…" : "Use Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}

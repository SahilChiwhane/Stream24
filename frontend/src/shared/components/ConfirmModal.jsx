import React from "react";

export default function ConfirmModal({
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dim Background */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className="
        relative z-10 w-full max-w-md
        rounded-2xl bg-[#0b0b0b]/95 border border-white/10
        shadow-[0_25px_80px_rgba(0,0,0,0.75)]
        p-6
      "
      >
        <h3 className="text-lg font-bold text-white">{title}</h3>

        <p className="text-sm text-gray-300 mt-2 leading-relaxed">{message}</p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "danger", // "danger" or "primary"
}) {
  React.useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-black/90 border border-white/10 shadow-2xl p-6 z-10">
        <h2 className="text-xl font-bold mb-3 text-white">{title}</h2>

        <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-white/5 transition font-medium"
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-lg font-semibold transition
              ${
                confirmStyle === "danger"
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import ConfirmModal from "../../../shared/components/ConfirmModal";

export default function DeleteAccountSection({ auth, onAccountDeleted }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  const triggerDelete = () => {
    if (!canDelete || loading) return;
    setShowModal(true);
  };

  const performDelete = async () => {
    setShowModal(false);

    setLoading(true);

    try {
      // 🔹 Call Backend to delete api
      const { default: api } = await import("../../../services/api");
      await api.delete("/users/me");

      onAccountDeleted?.();
    } catch (err) {
      console.error("Delete account failed:", err);
      alert("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-red-500/10 bg-[#121212] p-6 relative shadow-2xl flex flex-col justify-between font-sans">
      {/* Background Warning Icon Static */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <FaTrashAlt className="w-20 h-20 text-red-500" />
      </div>

      <div className="relative z-10 text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <FaExclamationTriangle className="text-red-500 w-4 h-4 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Danger Zone
          </h2>
        </div>

        <p className="text-gray-500 font-medium mb-6 text-sm leading-relaxed max-w-sm tracking-tight">
          Permanently purge your account data. This action is{" "}
          <strong>irreversible</strong>.
        </p>
      </div>

      <div className="relative z-10 space-y-4">
        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 ml-1">
            Confirm with "DELETE"
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            className="
              w-full px-4 py-3 rounded-xl
              bg-white/[0.03] border border-white/5
              text-white font-mono text-sm tracking-[0.2em] uppercase placeholder:text-gray-700 placeholder:font-sans placeholder:tracking-normal
              focus:bg-white/[0.05] focus:border-red-500/40
              outline-none transition-all duration-300
            "
          />
        </div>

        <button
          type="button"
          onClick={triggerDelete}
          disabled={!canDelete || loading}
          className={`
            relative w-full px-5 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-300 overflow-hidden
            ${
              !canDelete || loading
                ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                : "bg-red-600/80 text-white shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:bg-red-600 active:scale-[0.98] border border-red-500/50"
            }
          `}
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaTrashAlt className="w-3 h-3" />
            )}
            {loading ? "Purging..." : "Delete Account"}
          </div>
        </button>
      </div>

      {showModal && (
        <ConfirmModal
          title="Delete Account Permentantly?"
          message="This action cannot be undone. All your data, watch history, and subscription will be immediately removed."
          confirmText="Yes, Delete Everything"
          cancelText="Cancel"
          onConfirm={performDelete}
          onCancel={() => setShowModal(false)}
        />
      )}
    </section>
  );
}

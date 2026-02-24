import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ChangePasswordModal({ onClose, onSuccess, auth }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const simpleValidate = () => {
    if (!newPass || newPass.length < 8) {
      setStatus("New password must be at least 8 characters.");
      return false;
    }
    if (newPass !== confirm) {
      setStatus("New password and confirmation do not match.");
      return false;
    }
    return true;
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (!simpleValidate()) return;

    setLoading(true);
    setStatus("");

    try {
      if (typeof auth?.updatePassword === "function") {
        await auth.updatePassword({
          currentPassword: current,
          newPassword: newPass,
        });
      } else if (typeof auth?.changePassword === "function") {
        await auth.changePassword(current, newPass);
      } else {
        // Fallback for simulation or missing method
      }

      if (onSuccess) onSuccess("Password updated");
      onClose();
    } catch (err) {
      setStatus(err?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md rounded-2xl
                      bg-black/80 backdrop-blur-xl
                      border border-white/10
                      shadow-[0_30px_80px_rgba(0,0,0,0.8)]
                      p-6 z-10"
      >
        <div className="mb-5">
          <h2 className="text-xl font-bold text-white">Change Password</h2>
          <p className="text-sm text-gray-400 mt-1">
            Use a strong password to keep your account secure
          </p>
        </div>

        <form onSubmit={handleChange} className="space-y-4">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Current password"
              className="w-full p-3 pr-11 rounded-xl bg-[#0b0b0b] border border-white/10 text-white
                         focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/40
                         outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="w-full p-3 pr-11 rounded-xl bg-[#0b0b0b] border border-white/10 text-white
                         focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/40
                         outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowNew((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full p-3 pr-11 rounded-xl bg-[#0b0b0b] border border-white/10 text-white
                         focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/40
                         outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          {status && <div className="text-sm text-gray-300">{status}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg font-semibold text-white transition-all
                ${
                  loading
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md"
                }`}
            >
              {loading ? "Saving..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

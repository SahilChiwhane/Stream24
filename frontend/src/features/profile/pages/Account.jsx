import React, { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { useProfileForm } from "../hooks/useProfileForm";

import ProfileForm from "../components/ProfileForm";
import ChangePasswordModal from "../../../shared/components/ChangePasswordModal";
import DeleteAccountSection from "../components/DeleteAccountSection";
import AvatarPicker from "../components/AvatarPicker";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import api from "../../../services/api";

import {
  FaCamera,
  FaLock,
  FaCalendarAlt,
  FaClock,
  FaIdCard,
} from "react-icons/fa";

/* ---------- Helpers ---------- */
const getInitials = (name = "") => {
  const s = name?.trim() || "?";
  const parts = s.split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function Account() {
  const auth = useAuth();

  // Use Custom Hook for Logic
  const {
    form,
    initialForm,
    subscription,
    metadata,
    loading,
    statusMessage,
    errors,
    handleChange,
    save,
    updateAvatar,
    setStatusMessage,
    isDirty,
  } = useProfileForm();

  const [showChangePass, setShowChangePass] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  /* ---------- Avatar Actions ---------- */
  const handleAvatarSelect = async (a) => {
    await updateAvatar(a);
    setShowAvatarPicker(false);
  };

  const handleAvatarRemove = async () => {
    await updateAvatar(null);
  };

  /* ---------- Cancel Subscription ---------- */
  const askCancelSubscription = () => setShowCancelModal(true);

  const confirmCancelSubscription = async () => {
    try {
      setStatusMessage("Cancelling...");
      await api.post("/subscription/cancel");
      window.location.reload(); // Simple reload to refresh subscription state for now
    } catch (err) {
      console.error("Cancel failed", err);
      setStatusMessage("Failed to cancel subscription");
    } finally {
      setShowCancelModal(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white px-4 py-6 font-sans tracking-tight">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Profile identity block skeleton */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 md:p-14">
            <div className="flex flex-col md:flex-row gap-16">
              {/* Left: avatar + buttons */}
              <div className="flex flex-col items-center md:min-w-[280px] gap-6">
                <div className="skeleton w-44 h-44 rounded-3xl" />
                <div className="skeleton h-6 w-36 rounded-lg" />
                <div className="skeleton h-11 w-full max-w-[280px] rounded-xl" />
              </div>
              {/* Right: form fields */}
              <div className="flex-1 space-y-8 pt-2">
                <div className="space-y-2">
                  <div className="skeleton h-10 w-64 rounded-lg" />
                  <div className="skeleton h-4 w-80 rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="skeleton h-12 w-full rounded-xl" />
                  <div className="skeleton h-12 w-full rounded-xl" />
                </div>
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="skeleton h-12 w-36 rounded-2xl" />
              </div>
            </div>
          </div>
          {/* Subscription + delete block skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="skeleton h-72 rounded-[2.5rem]" />
            <div className="skeleton h-72 rounded-[2.5rem]" />
          </div>
        </div>
      </div>
    );

  // Use initialForm (persisted data) for display areas to prevent "auto-save" effect
  // while typing in the form.
  const displayName = initialForm
    ? `${initialForm.firstName} ${initialForm.lastName}`.trim()
    : "";

  // const initialName = ... (restored for ProfileForm prop)
  const initialName = initialForm
    ? `${initialForm.firstName} ${initialForm.lastName}`.trim()
    : "";

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 font-sans tracking-tight">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Tier 1: Unified Profile Identity Block */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row gap-16">
            {/* Left: Avatar & Primary Actions (Centered Column) */}
            <div className="flex flex-col items-center md:min-w-[280px] text-center">
              <div className="relative mb-8">
                <div className="relative w-44 h-44 rounded-3xl overflow-hidden border border-white/10 bg-[#0b0b0b] shadow-2xl">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black uppercase tracking-widest text-blue-600">
                      {getInitials(displayName)}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowAvatarPicker((prev) => !prev)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-black/90 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-xl text-white/70 hover:text-white"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
              </div>

              <div className="text-2xl font-black text-white tracking-tight mb-8">
                {displayName || "User"}
              </div>

              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <button
                  onClick={() => setShowChangePass(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gray-800 text-white text-[11px] font-black uppercase tracking-[0.15em] hover:bg-blue-500 transition-all active:scale-95 shadow-md"
                >
                  <FaLock className="w-3 h-3" /> Update Password
                </button>

                {form.avatarUrl && (
                  <button
                    onClick={handleAvatarRemove}
                    className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors py-1"
                  >
                    Remove Avatar
                  </button>
                )}
              </div>
            </div>

            {/* Right: Profile Form */}
            <div className="flex-1 space-y-10">
              <div className="mb-6 text-left">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
                  Hello,{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {initialForm?.firstName || "Member"}
                  </span>
                </h1>
                <p className="text-gray-500 font-medium text-lg leading-relaxed">
                  Update your account details and profile information.
                </p>
              </div>

              <ProfileForm
                savedName={initialName}
                firstName={form.firstName}
                setFirstName={(val) => handleChange("firstName", val)}
                lastName={form.lastName}
                setLastName={(val) => handleChange("lastName", val)}
                email={form.email}
                statusMessage={statusMessage}
                setStatusMessage={setStatusMessage}
                fieldErrors={errors}
                bare={true}
              />

              {/* Save Button */}
              <div className="mt-6 flex justify-start">
                <button
                  onClick={() => save(false)}
                  disabled={loading || !isDirty}
                  className={`
                    relative group overflow-hidden px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all duration-300
                    ${
                      loading
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-500 hover:-translate-y-0.5 active:scale-95 shadow-md"
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>Save Changes</>
                    )}
                  </span>
                  {/* Sheen Effect Removed */}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Side-by-Side Compact Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Subscription Section */}
          <div className="bg-[#121212] border border-white/[0.05] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group flex flex-col justify-between font-sans">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <FaIdCard className="w-20 h-20 text-blue-600" />
            </div>

            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-1.5 rounded-lg bg-blue-600/10 border border-blue-600/20">
                  <FaIdCard className="text-blue-600 w-4 h-4 shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Current Membership
                </h2>
                <div className="ml-auto px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  Active
                </div>
              </div>

              <div className="text-4xl font-black text-white mb-1 tracking-tighter">
                {subscription ? subscription.planName : "Free"}
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em] mb-10">
                {subscription
                  ? `Renewal: ${subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—"}`
                  : "Upgrade to Stream24 Premium"}
              </div>

              {/* User Metadata integrated here */}
              <div className="pt-12 border-t border-white/5 grid grid-cols-2 gap-4 mb-8">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                    <FaCalendarAlt className="w-2.5 h-2.5" />
                    <span>Member Since</span>
                  </div>
                  <div className="text-sm font-bold text-gray-300 tracking-tight">
                    {metadata.memberSince &&
                      new Date(metadata.memberSince).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          year: "numeric",
                        },
                      )}
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-end gap-2 text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                    <FaClock className="w-2.5 h-2.5" />
                    <span>Last Sign-In</span>
                  </div>
                  <div className="text-sm font-bold text-gray-300 tracking-tight">
                    {metadata.lastSignIn &&
                      new Date(metadata.lastSignIn).toLocaleDateString(
                        undefined,
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}
                  </div>
                </div>
              </div>

              {subscription && (
                <button
                  onClick={askCancelSubscription}
                  className="w-full py-4 rounded-2xl bg-white/[0.04] border border-white/5 text-white/50 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all duration-300 active:scale-[0.98] shadow-lg"
                >
                  Manage Membership
                </button>
              )}
            </div>
          </div>

          {/* Delete Account Section */}
          <DeleteAccountSection
            auth={auth}
            onAccountDeleted={() => auth.logout()}
          />
        </div>
      </div>

      {/* Modals */}
      {showChangePass && (
        <ChangePasswordModal
          onClose={() => setShowChangePass(false)}
          onSuccess={(msg) => setStatusMessage(msg)}
          auth={auth}
        />
      )}

      {showAvatarPicker && (
        <AvatarPicker
          current={form.avatarId}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      {showCancelModal && (
        <ConfirmModal
          title="Turn off auto-renew?"
          message="Your plan will remain active until the end of the billing period. You won’t be charged again unless you restart your membership."
          confirmText="Confirm Cancel"
          cancelText="Keep Subscription"
          onConfirm={confirmCancelSubscription}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}

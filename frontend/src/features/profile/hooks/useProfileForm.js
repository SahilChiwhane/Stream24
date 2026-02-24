import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import api from "../../../services/api";

export const useProfileForm = () => {
  const { user, refreshUser } = useAuth();

  // Form State
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    avatarId: null,
    avatarUrl: null,
  });

  const [initialForm, setInitialForm] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [metadata, setMetadata] = useState({
    memberSince: null,
    lastSignIn: null,
  });

  // Status State
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState({});

  const savingRef = useRef(false);

  // Check if form is dirty
  const isDirty =
    initialForm &&
    (form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName ||
      form.avatarUrl !== initialForm.avatarUrl);

  // Load Profile Data
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);

        // Fetch Profile
        const res = await api.get("/users/me");
        const profile = res.data?.data?.profile || {};

        // Fetch Subscription
        const subRes = await api.get("/subscription/me");
        const subData = subRes.data?.data?.subscription || null;

        if (mounted) {
          const loadedForm = {
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || user.email || "",
            avatarId: profile.avatarId || null,
            avatarUrl: profile.avatarUrl || null,
          };

          setForm(loadedForm);
          setInitialForm(loadedForm);
          setSubscription(subData);
          setMetadata({
            memberSince: user.metadata?.creationTime || null,
            lastSignIn: user.metadata?.lastSignInTime || null,
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (mounted) setStatusMessage("Failed to load profile data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user, user?.uid]);

  // Persist Changes
  const save = useCallback(
    async (silent = false, overrides = {}) => {
      if (savingRef.current) return false;

      // Validate before saving (unless silent autosave, but even then good to check)
      // For now, we allow saving partial invalid states if needed, but ideally we block.
      // Let's rely on backend validation for critical checks, but use frontend for feedback.

      savingRef.current = true;
      setSaveStatus("saving");
      if (!silent) setStatusMessage("");
      setErrors({});

      const payload = { ...form, ...overrides };

      try {
        const res = await api.put("/users/me", payload);

        if (res.data?.success) {
          const d = res.data.data.profile;

          // Update initial form to new state
          const newState = {
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            email: d.email || form.email,
            avatarId: d.avatarId || null,
            avatarUrl: d.avatarUrl || null,
          };

          setForm(newState);
          setInitialForm(newState);
          setSaveStatus("saved");

          if (!silent) setStatusMessage("Changes saved");

          setTimeout(() => {
            setSaveStatus("idle");
            // Status message clearing is now handled by the UI component (ProfileForm)
            // to prevent race conditions and "double toast" issues.
          }, 2000);

          await refreshUser(); // Sync with AuthContext
          return true;
        }
      } catch (err) {
        console.error("Save failed:", err);
        setSaveStatus("error");

        const errorData = err.response?.data?.error;
        if (errorData?.code === "VALIDATION_ERROR" && errorData?.fields) {
          const backendErrors = {};
          errorData.fields.forEach((f) => (backendErrors[f.field] = f.message));
          setErrors(backendErrors);
          if (!silent) setStatusMessage("Please fix the errors");
        } else {
          if (!silent) setStatusMessage("Failed to save changes");
        }
        return false;
      } finally {
        savingRef.current = false;
      }
    },
    [form, refreshUser],
  );

  // Handlers
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateAvatar = async (avatar) => {
    const newUrl = avatar ? avatar.url : null;
    const newId = avatar ? avatar.id : null;

    setForm((prev) => ({ ...prev, avatarUrl: newUrl, avatarId: newId }));
    // Auto-save removed to allow drafting/previewing.
    // Changes will persist only when 'Save Changes' is clicked.
  };

  // Autosave Effect REMOVED as per user request
  // Manual save only via 'save()'

  return {
    form,
    initialForm,
    subscription,
    metadata,
    loading,
    saveStatus,
    statusMessage,
    errors,
    isDirty,
    handleChange,
    save,
    updateAvatar,
    setSaveStatus, // Exposed for manual resets if needed
    setStatusMessage,
  };
};

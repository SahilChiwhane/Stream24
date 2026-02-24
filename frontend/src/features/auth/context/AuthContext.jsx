import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../services/firebase";
import api from "../../../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Refs to allow stable access inside the auth listener without triggering re-effects
  const userRef = React.useRef(null);
  const initializedRef = React.useRef(false);
  const fetchingSessionRef = React.useRef(null);

  // Sync refs with state
  React.useEffect(() => {
    userRef.current = user;
    initializedRef.current = initialized;
  }, [user, initialized]);

  const fetchSession = async (fbUser) => {
    if (!fbUser) return;

    const currentUid = fbUser.uid;
    if (fetchingSessionRef.current === currentUid) return;
    fetchingSessionRef.current = currentUid;

    try {
      // ⚡ Only force refresh if we absolutely need to, otherwise use cached token
      const token = await fbUser.getIdToken();

      const res = await api.get("/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sessionUser = res.data.data.user;

      let profile = {};
      try {
        const profileRes = await api.get("/users/me");
        profile = profileRes.data?.data?.profile || {};
      } catch (pErr) {
        console.warn("Profile fetch skipped during bootstrap:", pErr.message);
      }

      // Hydrate from profile with flattening fallback
      const finalFirstName =
        profile.firstName || profile.profile?.firstName || "";
      const finalLastName = profile.lastName || profile.profile?.lastName || "";
      const finalName =
        profile.name ||
        profile.profile?.name ||
        sessionUser.name ||
        fbUser.displayName ||
        "";

      setUser({
        uid: currentUid,
        email: fbUser.email,
        firstName: finalFirstName,
        lastName: finalLastName,
        name: finalName,
        avatarUrl: profile.avatarUrl || profile.profile?.avatar || null,
        role: sessionUser.role || "user",
        accountStatus: sessionUser.accountStatus,
        metadata: fbUser.metadata,
      });
    } catch (err) {
      console.error("Auth session fetch failed:", err);
      // Don't null out user on minor errors, but log it
    } finally {
      if (fetchingSessionRef.current === currentUid) {
        fetchingSessionRef.current = null;
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      // If we already have a user and it's the same UID, don't trigger full reload
      // unless we aren't yet fully initialized
      if (initializedRef.current && userRef.current?.uid === fbUser.uid) {
        return;
      }

      // Avoid showing loader if we're just refreshing a valid session
      if (!initializedRef.current) {
        setLoading(true);
      }

      setInitialized(false);

      try {
        await fbUser.reload();
        await fetchSession(fbUser);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []); // ⚡ SAFE: Dependencies are handled via refs

  const refreshUser = React.useCallback(async () => {
    if (!auth.currentUser) return;
    await fetchSession(auth.currentUser);
  }, []); // fetchSession is stable inside the component scope here

  const changePassword = React.useCallback(
    async (currentPassword, newPassword) => {
      // We'll use the backend for this to ensure consistency and logging
      await api.put("/users/me/password", { currentPassword, newPassword });
    },
    [],
  );

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  const value = React.useMemo(
    () => ({
      user,
      loading,
      initialized,
      logout,
      refreshUser,
      changePassword,
    }),
    [user, loading, initialized, refreshUser, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  getMyPreferences,
  updateMyPreferences,
} from "../services/preferences.service";

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const { user, initialized } = useAuth();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;

    let mounted = true;

    const load = async () => {
      try {
        if (!user) {
          setPrefs(null);
          return;
        }
        const data = await getMyPreferences();
        if (mounted) setPrefs(data);
      } catch (err) {
        console.error("FAILED TO LOAD PREFS", err);
        if (mounted) setPrefs(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user, initialized]);

  const update = async (patch) => {
    try {
      // Optimistic Update
      setPrefs((prev) => (prev ? { ...prev, ...patch } : patch));

      const updated = await updateMyPreferences(patch);
      setPrefs(updated);
    } catch (err) {
      console.error("FAILED TO UPDATE PREFS", err);
      // Re-fetch to sync if failed
      const fresh = await getMyPreferences();
      setPrefs(fresh);
      throw err;
    }
  };

  return (
    <PreferencesContext.Provider value={{ prefs, loading, update }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const usePreferences = () => useContext(PreferencesContext);

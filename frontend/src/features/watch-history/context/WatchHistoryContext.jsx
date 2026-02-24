import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  fetchWatchHistory,
  removeFromWatchHistory,
} from "../services/watchHistory.service";
import { useAuth } from "../../auth/context/AuthContext";

const WatchHistoryContext = createContext(null);

export function WatchHistoryProvider({ children }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchWatchHistory();
      setHistory(data || []);
      setError(null);
    } catch (err) {
      console.error("[HISTORY_CONTEXT] Failed to fetch:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const removeFromHistory = async (historyId) => {
    try {
      await removeFromWatchHistory(historyId);
      setHistory((prev) => prev.filter((item) => item.id !== historyId));
    } catch (err) {
      console.error("[HISTORY_CONTEXT] Remove failed:", err);
      throw err;
    }
  };

  const refresh = useCallback(() => loadHistory(), [loadHistory]);

  const value = useMemo(
    () => ({
      history,
      loading,
      error,
      refresh,
      removeFromHistory,
    }),
    [history, loading, error, refresh, removeFromHistory],
  );

  return (
    <WatchHistoryContext.Provider value={value}>
      {children}
    </WatchHistoryContext.Provider>
  );
}

export function useWatchHistory() {
  const ctx = useContext(WatchHistoryContext);
  if (!ctx)
    throw new Error("useWatchHistory must be used inside WatchHistoryProvider");
  return ctx;
}

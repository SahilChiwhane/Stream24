import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { resolvePlayback } from "../services/playback.service";
import { getContentDetails } from "../../details/services/details.service";
import {
  upsertWatchHistory,
  fetchWatchHistory,
  removeFromWatchHistory,
} from "../../watch-history/services/watchHistory.service";
import { FaArrowLeft } from "react-icons/fa";
import { useWatchHistory } from "../../watch-history/context/WatchHistoryContext";

const COMPLETION_THRESHOLD = 0.95;

const isYouTubeUrl = (url) =>
  url?.includes("youtube.com") || url?.includes("youtu.be");

export default function Player() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useWatchHistory();

  const [allUrls, setAllUrls] = useState([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFallbackButton, setShowFallbackButton] = useState(false);
  const [isYtReady, setIsYtReady] = useState(!!(window.YT && window.YT.Player));
  const [initialStartTime, setInitialStartTime] = useState(0);
  const [uiProgress, setUiProgress] = useState(0);

  const progressRef = useRef(0);
  const durationRef = useRef(0);
  const sessionStartRef = useRef(null);
  const seasonRef = useRef(null);
  const episodeRef = useRef(null);
  const detailsRef = useRef(null);
  const mountedRef = useRef(true);
  const lastInitIdRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const lastSavedRef = useRef(-1);
  const iframeRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const completedRef = useRef(false);

  /* ───────────────── SAVE OR DELETE PROGRESS ───────────────── */

  const saveOrCleanupProgress = useCallback(
    async (currentProgress) => {
      if (!detailsRef.current || completedRef.current) return;

      const progress =
        typeof currentProgress === "number"
          ? currentProgress
          : progressRef.current;

      // Priority: 1. API Duration (Stream Length)
      let resolvedDuration = durationRef.current;

      // CRITICAL: Block saving ONLY if we have no progress.
      // We still try to save even if duration is missing (as null)
      // so the record is created in the database.
      if (progress <= 0) return;

      let durationToSave =
        resolvedDuration && resolvedDuration > 0 ? resolvedDuration : null;

      // Double-check to ensure 0 never leaks as duration
      if (durationToSave === 0) durationToSave = null;

      const ratio =
        durationToSave && durationToSave > 0 ? progress / durationToSave : 0;
      const remaining = resolvedDuration - progress;
      const isCompleted =
        ratio >= COMPLETION_THRESHOLD ||
        (resolvedDuration > 20 && remaining < 10);

      const resolvedTitle =
        detailsRef.current?.title || detailsRef.current?.name || "Untitled";

      if (resolvedDuration > 0 && isCompleted) {
        completedRef.current = true;

        try {
          const isEpisodic = ["tv", "series", "anime"].includes(mediaType);
          const historyId = isEpisodic
            ? `${id}_S${seasonRef.current}_E${episodeRef.current}`
            : `${id}`;

          await removeFromWatchHistory(historyId);
          setTimeout(() => refresh(), 500);
        } catch (err) {
          console.error("[PLAYER] Failed to delete completed history:", err);
        }
        return;
      }

      try {
        await upsertWatchHistory({
          contentId: id,
          contentType: mediaType,
          title: resolvedTitle,
          thumbnail:
            detailsRef.current.posterUrl ||
            detailsRef.current.backdropUrl ||
            "",
          season: seasonRef.current,
          episode: episodeRef.current,
          durationSeconds: durationToSave,
          progress,
          isAnime: detailsRef.current.isAnime || false,
        });

        // REMOVED refresh() from interval save to prevent 429 storms
      } catch (err) {
        console.error("[PLAYER] Progress save failed:", err);
      }
    },
    [id, mediaType, refresh],
  );

  const saveProgressRef = useRef(saveOrCleanupProgress);
  useEffect(() => {
    saveProgressRef.current = saveOrCleanupProgress;
  }, [saveOrCleanupProgress]);

  /* ───────────────── CLEANUP ───────────────── */

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      // Save last known position on exit
      if (progressRef.current > 2) {
        saveProgressRef.current(progressRef.current);
      }
    };
  }, []);

  /* ───────────────── WALL CLOCK + YT POLLING ───────────────── */

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    sessionStartRef.current = Date.now();
    const resumeBase = progressRef.current;

    pollingIntervalRef.current = setInterval(() => {
      if (!mountedRef.current || completedRef.current) return;

      let currentTime = resumeBase;

      if (ytPlayerRef.current?.getCurrentTime) {
        try {
          const t = ytPlayerRef.current.getCurrentTime();
          const d = ytPlayerRef.current.getDuration();

          // Prefer real video duration from the player API
          if (d > 0 && d !== durationRef.current) {
            durationRef.current = d;
          }
          if (t > 0) currentTime = t;
        } catch {}
      }

      if (currentTime === resumeBase && sessionStartRef.current) {
        currentTime =
          resumeBase + (Date.now() - sessionStartRef.current) / 1000;
      }

      progressRef.current = currentTime;
      setUiProgress(currentTime);

      const floor = Math.floor(currentTime);
      if (floor > 0 && floor % 5 === 0 && floor !== lastSavedRef.current) {
        lastSavedRef.current = floor;
        saveProgressRef.current(currentTime);
      }
    }, 1000);
  }, []);

  /* ───────────────── YOUTUBE API ───────────────── */

  useEffect(() => {
    if (window.YT?.Player) {
      setIsYtReady(true);
      return;
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      setIsYtReady(true);
      if (prevReady) prevReady();
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    if (!isYtReady || !iframeRef.current || !allUrls.length) return;

    const url = allUrls[currentUrlIndex];
    if (!isYouTubeUrl(url)) return;

    ytPlayerRef.current?.destroy?.();

    new window.YT.Player(iframeRef.current, {
      playerVars: {
        start: Math.floor(progressRef.current),
        autoplay: 1,
        enablejsapi: 1,
      },
      events: {
        onReady: (e) => {
          ytPlayerRef.current = e.target;
          const d = e.target.getDuration();
          if (d > 0) {
            durationRef.current = d;
          }
          if (progressRef.current > 0) {
            e.target.seekTo(progressRef.current, true);
          }
          startPolling();
        },
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            const d = e.target.getDuration();
            if (d > 0 && d !== durationRef.current) {
              durationRef.current = d;
            }
          }
          if (e.data === window.YT.PlayerState.PAUSED) {
            const t = e.target.getCurrentTime();
            if (t > 0) {
              progressRef.current = t;
              saveProgressRef.current(t);
            }
          }
          if (e.data === window.YT.PlayerState.ENDED) {
            progressRef.current = durationRef.current || progressRef.current;
            saveProgressRef.current(progressRef.current);
          }
        },
        onError: () => {
          if (currentUrlIndex + 1 < allUrls.length) {
            setCurrentUrlIndex((i) => i + 1);
            setLoading(true);
          } else {
            setError("Playback failed on all available mirrors.");
          }
        },
      },
    });
  }, [allUrls, currentUrlIndex, isYtReady]);

  /* ───────────────── INITIALIZE PLAYER ───────────────── */

  useEffect(() => {
    const initKey = `${id}-${location.search}`;
    if (lastInitIdRef.current === initKey) return;
    lastInitIdRef.current = initKey;

    async function init() {
      try {
        setLoading(true);
        setError(null);
        progressRef.current = 0;
        durationRef.current = 0;
        completedRef.current = false;
        lastSavedRef.current = -1;

        const params = new URLSearchParams(location.search);
        seasonRef.current = Number(params.get("season")) || null;
        episodeRef.current = Number(params.get("episode")) || null;

        const details = await getContentDetails(mediaType, id);
        detailsRef.current = {
          ...details,
          title: details.title || details.name,
        };

        const playback = await resolvePlayback({
          contentId: id,
          contentType: mediaType,
          season: seasonRef.current,
          episode: episodeRef.current,
        });

        const origin = window.location.origin;
        const urls = [
          playback.playbackUrl,
          ...(playback.fallbackUrls || []),
        ].map((u) => {
          if (isYouTubeUrl(u)) {
            // Handle both full URLs and video IDs if returned
            const videoId = u.includes("v=")
              ? u.split("v=")[1].split("&")[0]
              : u;
            return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${origin}&mute=1`;
          }
          return u;
        });

        const history = await fetchWatchHistory();
        const isEpisodic = ["tv", "series", "anime"].includes(mediaType);

        const item = history.find((h) => {
          const idMatch = String(h.contentId) === String(id);
          if (!idMatch) return false;

          if (!isEpisodic) return true; // Movie matches by ID alone

          // Series matches by ID + Season + Episode
          return (
            Number(h.season) === Number(seasonRef.current) &&
            Number(h.episode) === Number(episodeRef.current)
          );
        });

        if (item && typeof item.progress === "number") {
          progressRef.current = item.progress;
          setInitialStartTime(Math.floor(item.progress));

          // SEED DURATION FROM HISTORY:
          // This prevents sending 'null' during the first few seconds of a resume session.
          if (item.durationSeconds && item.durationSeconds > 0) {
            durationRef.current = item.durationSeconds;
          }
        } else {
          progressRef.current = 0;
          setInitialStartTime(0);
        }

        setAllUrls(urls);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id, mediaType, location.search]);

  useEffect(() => {
    let timer;
    if (loading && !error) {
      timer = setTimeout(() => setShowFallbackButton(true), 6000);
    } else {
      setShowFallbackButton(false);
    }
    return () => clearTimeout(timer);
  }, [loading, error, currentUrlIndex]);

  /* ───────────────── UI ───────────────── */

  const urlWithStart = useMemo(() => {
    if (!allUrls[currentUrlIndex]) return null;
    const url = allUrls[currentUrlIndex];
    if (initialStartTime > 0) {
      const sep = url.includes("?") ? "&" : "?";
      return `${url}${sep}start=${initialStartTime}`;
    }
    return url;
  }, [allUrls, currentUrlIndex, initialStartTime]);

  return (
    <div className="fixed inset-0 bg-black z-[9999]">
      <button
        className="absolute top-6 left-6 text-white/40 hover:text-white transition-colors z-[100]"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft size={22} />
      </button>

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 z-[99]">
          <div className="w-8 h-8 border-2 border-white/5 border-t-white/40 rounded-full animate-spin mb-4" />
          <p className="text-sm">Loading media...</p>
          {showFallbackButton && allUrls.length > 1 && (
            <button
              onClick={() =>
                setCurrentUrlIndex((i) => (i + 1) % allUrls.length)
              }
              className="mt-6 bg-white/10 px-4 py-2 rounded-lg text-xs hover:bg-white/20"
            >
              Try Mirror Source
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-6">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-white/40 underline"
          >
            Go Back
          </button>
        </div>
      )}

      {urlWithStart && (
        <div className="w-full h-full relative group">
          <iframe
            ref={iframeRef}
            src={urlWithStart}
            title="Stream24 Player"
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            onLoad={startPolling}
          />
        </div>
      )}
    </div>
  );
}

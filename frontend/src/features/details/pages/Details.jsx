import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getContentDetails,
  getSeasonDetails,
} from "../services/details.service";
import { resolvePlayback } from "../../player/services/playback.service";
import PersonCard from "../../browse/components/PersonCard";
import { useWishlist } from "../../wishlist/context/WishlistContext";
import {
  FaChevronDown,
  FaPlay,
  FaPlus,
  FaHeart,
  FaClock,
} from "react-icons/fa";
import {
  fetchWatchHistory,
  upsertWatchHistory,
} from "../../watch-history/services/watchHistory.service";

/**
 * Industrial Details Redesign: "The Series First Experience"
 * Optimized for cinematic clarity and episodic discovery.
 */
export default function Details() {
  const { mediaType, id } = useParams();
  const navigate = useNavigate();
  const { add, remove, exists } = useWishlist();

  const [details, setDetails] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState(null);
  const [allFallbacks, setAllFallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [historyItem, setHistoryItem] = useState(null);

  // Episodic State
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonData, setSeasonData] = useState(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  // Overview Clamping
  const [isExpanded, setIsExpanded] = useState(false);

  // Pagination for Episodes
  const [visibleEpisodes, setVisibleEpisodes] = useState(8);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [apiLoaded, setApiLoaded] = useState(!!(window.YT && window.YT.Player));
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Industrial Loop Refs
  const loopRef = useRef({ start: 0, end: 15, midSet: false });
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const inList = exists(id);

  // Load YouTube API Script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiLoaded(true);
      return;
    }

    const checkApi = setInterval(() => {
      if (window.YT && window.YT.Player) {
        setApiLoaded(true);
        clearInterval(checkApi);
      }
    }, 100);

    if (!document.getElementById("yt-api-script")) {
      const tag = document.createElement("script");
      tag.id = "yt-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(checkApi);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const loadSeason = useCallback(
    async (num) => {
      try {
        setLoadingSeason(true);
        const data = await getSeasonDetails(id, num);
        setSeasonData(data);
      } catch (err) {
        // Failed to load season details
      } finally {
        setLoadingSeason(false);
      }
    },
    [id],
  );

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        if (!details) {
          setLoading(true);
        }

        const searchParams = new URLSearchParams(window.location.search);
        const urlSeason = searchParams.get("season");

        // ⚡ Fire content fetch + watch history IN PARALLEL — don't wait sequentially
        const [data, history] = await Promise.all([
          getContentDetails(mediaType, id),
          fetchWatchHistory().catch(() => []),
        ]);

        if (!mounted) return;
        setDetails(data);

        const existingItem = history.find(
          (h) => String(h.contentId) === String(id),
        );
        if (existingItem) {
          setProgress(existingItem.progress);
          setHistoryItem(existingItem);
        }

        const isEpisodic = data.mediaType === "tv";
        const s =
          isEpisodic && urlSeason
            ? Number(urlSeason)
            : isEpisodic && existingItem?.season
              ? existingItem.season
              : isEpisodic
                ? 1
                : undefined;
        const e =
          isEpisodic && existingItem?.episode
            ? existingItem.episode
            : isEpisodic
              ? 1
              : undefined;

        if (isEpisodic && s) {
          setSelectedSeason(s);
          loadSeason(s);
        }

        // --- CONTENT OVERRIDES: Hardcoded links for specific titles ---
        const titleLower = (data.title || data.name || "").toLowerCase();
        const isDeathNote = titleLower.includes("death note");
        const isZootopia2 = titleLower.includes("zootopia 2");

        if (isDeathNote || isZootopia2) {
          const videoId = isDeathNote ? "-W_7p9pL0y4" : "5AwtptT8X8k";
          setTrailerUrl(videoId);
          loopRef.current = isDeathNote
            ? { start: 5, end: 20 }
            : { start: 0, end: 15 };
        }

        // ⚡ Kick off playback resolution immediately — doesn't block page render
        resolvePlayback({
          contentId: id,
          contentType: data.mediaType,
          season: s,
          episode: e,
        })
          .then((pb) => {
            if (!mounted) return;

            if (pb?.playbackUrl && !isDeathNote && !isZootopia2) {
              const videoId = pb.playbackUrl.includes("v=")
                ? pb.playbackUrl.split("v=")[1].split("&")[0]
                : pb.playbackUrl.split("/embed/")[1]?.split("?")[0];
              if (videoId) {
                setTrailerUrl(videoId);
              }
            }

            if (pb?.loopWindow && !isDeathNote && !isZootopia2) {
              loopRef.current = {
                start: pb.loopWindow.start,
                end: pb.loopWindow.end,
              };
            }
            if (pb?.fallbackUrls) setAllFallbacks(pb.fallbackUrls);
          })
          .catch(() => console.warn("Ambient trailer unavailable"));
      } catch (err) {
        console.error("Details Load Error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [mediaType, id, details, loadSeason]);

  // Reset state on media change
  useEffect(() => {
    setTrailerUrl(null);
    setIsVideoReady(false);
    // When changing titles, clear the old player ref to avoid zombie instances
    // attached to removed DOM elements.
    if (playerRef.current) {
      try {
        if (playerRef.current.destroy) playerRef.current.destroy();
      } catch (e) {}
      playerRef.current = null;
    }
  }, [id, mediaType]);

  // INDUSTRIAL PLAYER CORE
  // ⚡ Don't gate on `loading` — start player as soon as we have a trailerUrl + YT API ready
  useEffect(() => {
    if (!apiLoaded) return;

    const runLoopCheck = () => {
      const p = playerRef.current;
      if (
        !p ||
        typeof p.getCurrentTime !== "function" ||
        typeof p.getPlayerState !== "function"
      )
        return;

      try {
        const current = p.getCurrentTime();
        const { start, end } = loopRef.current;
        const state = p.getPlayerState();

        // 1. BOUNDARY SNAP: If outside loop, snap back to start
        if (current >= end - 0.3 || current < start - 2) {
          p.seekTo(start, true);
          p.playVideo();
        }

        // 2. RESURRECTION: Force play if paused by YouTube's internal logic
        if (state === window.YT.PlayerState.PAUSED) {
          p.playVideo();
        }
      } catch (e) {
        // Silent recovery
      }
    };

    const initOrUpdatePlayer = () => {
      const mount = document.getElementById("hero-trailer-mount");
      if (!mount) return;

      if (!trailerUrl) {
        if (playerRef.current && playerRef.current.stopVideo) {
          try {
            playerRef.current.stopVideo();
          } catch (e) {}
        }
        setIsVideoReady(false);
        return;
      }

      const playerOptions = {
        videoId: trailerUrl,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          playsinline: 1,
          vq: "hd1080",
          start: loopRef.current.start,
          origin: window.location.origin,
          host: "https://www.youtube-nocookie.com",
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            const d = event.target.getDuration();
            if (d > 0) {
              // Sync duration to backend if we have existing progress
              if (progress > 0 && historyItem) {
                upsertWatchHistory({
                  ...historyItem,
                  durationSeconds: d,
                }).catch(() => {});
              }
            }
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsVideoReady(true);
            }
            if (
              event.data === window.YT.PlayerState.ENDED ||
              event.data === window.YT.PlayerState.PAUSED
            ) {
              event.target.seekTo(loopRef.current.start, true);
              event.target.playVideo();
            }
          },
          onError: (event) => {
            // API Error
          },
        },
      };

      // ZOMBIE DETECTION
      const iframe = playerRef.current?.getIframe?.();
      const isZombie =
        playerRef.current && (!iframe || !document.body.contains(iframe));

      if (!playerRef.current || isZombie) {
        playerRef.current = new window.YT.Player(
          "hero-trailer-mount",
          playerOptions,
        );
      } else {
        try {
          playerRef.current.loadVideoById({
            videoId: trailerUrl,
            startSeconds: loopRef.current.start,
            suggestedQuality: "hd1080",
          });
          playerRef.current.playVideo();
          setIsVideoReady(true);
        } catch (e) {
          playerRef.current = new window.YT.Player(
            "hero-trailer-mount",
            playerOptions,
          );
        }
      }
    };

    const timer = setTimeout(initOrUpdatePlayer, 50);

    // Dynamic Interval Manager: Works across re-renders and fast switches
    let interval = null;
    if (isVideoReady && trailerUrl) {
      interval = setInterval(runLoopCheck, 100);
    }
    intervalRef.current = interval;

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [
    trailerUrl,
    apiLoaded,
    isVideoReady,
    allFallbacks,
    historyItem,
    progress,
  ]);

  // Termination Cleanup
  useEffect(() => {
    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  const handleSeasonChange = async (num) => {
    setSelectedSeason(num);
    setVisibleEpisodes(8);
    loadSeason(num);

    // Dynamic Ambient Trailer Update: Switch background video to the new season's trailer
    try {
      const pb = await resolvePlayback({
        contentId: id,
        contentType: details?.mediaType || "tv",
        season: num,
      });

      // CONTENT OVERRIDES: Hardcoded links for specific titles
      const titleLower = (details?.title || details?.name || "").toLowerCase();
      const isDeathNote = titleLower.includes("death note");
      const isZootopia2 = titleLower.includes("zootopia 2");

      if (isDeathNote || isZootopia2) {
        const videoId = isDeathNote ? "-W_7p9pL0y4" : "5AwtptT8X8k";
        const isSameVideo = videoId === trailerUrl;

        // Use hardcoded loop if it's our override
        loopRef.current = isDeathNote
          ? { start: 5, end: 20 }
          : { start: 0, end: 15 };

        if (isSameVideo && playerRef.current) {
          playerRef.current.seekTo(loopRef.current.start, true);
        } else {
          setIsVideoReady(false);
          setTrailerUrl(videoId);
        }
        return; // Skip standard resolution for hardcoded titles
      }

      if (pb?.playbackUrl) {
        const videoId = pb.playbackUrl.includes("v=")
          ? pb.playbackUrl.split("v=")[1].split("&")[0]
          : pb.playbackUrl.split("/embed/")[1]?.split("?")[0];

        if (videoId) {
          const isSameVideo = videoId === trailerUrl;

          if (pb?.loopWindow) {
            loopRef.current = {
              start: pb.loopWindow.start,
              end: pb.loopWindow.end,
            };
          }

          if (isSameVideo && playerRef.current) {
            playerRef.current.seekTo(loopRef.current.start, true);
          } else {
            setIsVideoReady(false);
            setTrailerUrl(videoId);
          }
        }
      }
    } catch (e) {
      // Failed to update ambient trailer for season change
    }
  };

  const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (!details && loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* ── Hero skeleton ── */}
        <div className="relative w-full min-h-[85vh] md:min-h-[90vh] bg-black overflow-hidden flex flex-col justify-end">
          {/* Backdrop shimmer */}
          <div className="skeleton absolute inset-0 rounded-none" />
          {/* Gradient overlays matching real layout */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

          {/* Bottom content skeleton */}
          <div className="absolute bottom-0 left-0 w-full z-20 px-6 md:px-12 pb-12 max-w-3xl space-y-4">
            {/* Meta row: year · rating · type · runtime */}
            <div className="flex gap-3">
              <div className="hero-skeleton-block h-4 w-10 rounded-full" />
              <div className="hero-skeleton-block h-4 w-12 rounded-full" />
              <div className="hero-skeleton-block h-4 w-14 rounded-full" />
              <div className="hero-skeleton-block h-4 w-16 rounded-full" />
            </div>
            {/* Title — two staggered lines */}
            <div className="hero-skeleton-block h-10 md:h-14 w-4/5 rounded-lg" />
            <div className="hero-skeleton-block h-10 md:h-14 w-3/5 rounded-lg" />
            {/* Tagline */}
            <div className="hero-skeleton-block h-4 w-2/5 rounded" />
            {/* Action buttons */}
            <div className="flex gap-4 pt-2">
              <div className="hero-skeleton-block h-12 w-32 rounded-lg" />
              <div className="hero-skeleton-block h-12 w-28 rounded-lg" />
            </div>
          </div>
        </div>

        {/* ── Content area skeleton ── */}
        <div className="px-6 md:px-12 pt-10 pb-6 space-y-10 bg-black">
          {/* Overview section */}
          <div className="max-w-3xl space-y-3">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-5/6 rounded" />
            <div className="skeleton h-3 w-4/6 rounded" />
            {/* Genre chips */}
            <div className="flex gap-2 pt-2">
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-6 w-14 rounded-full" />
            </div>
          </div>

          {/* Cast row */}
          <div className="space-y-4">
            <div className="skeleton h-6 w-28 rounded" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 space-y-2">
                  <div className="skeleton w-24 h-24 md:w-36 md:h-36 rounded-2xl" />
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-3 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!details) return null;

  const {
    title,
    overview,
    year,
    rating,
    genres = [],
    backdropUrl,
    posterUrl,
    tagline,
    runtime,
    cast = [],
    number_of_seasons,
    seasons = [],
    mediaType: backendType,
  } = details;

  const isEpisodic = backendType === "tv";

  // Dynamic Metadata Sync
  const displayTitle =
    isEpisodic && selectedSeason > 1 && seasonData?.name
      ? `${title}: ${seasonData.name}`
      : isEpisodic && selectedSeason > 1
        ? `${title} - Season ${selectedSeason}`
        : title;

  const displayPoster =
    isEpisodic && seasonData?.posterUrl ? seasonData.posterUrl : posterUrl;
  const displayOverview =
    isEpisodic && seasonData?.overview ? seasonData.overview : overview;
  const displayYear =
    isEpisodic && seasonData?.airDate
      ? new Date(seasonData.airDate).getFullYear()
      : year;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full min-h-[85vh] md:min-h-[90vh] bg-black overflow-hidden flex flex-col justify-end">
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#050505]">
          {/* UNDERLAY: Adaptive Poster System (Portrait for Mobile, Landscape for Desktop) */}
          <img
            src={
              isMobile
                ? displayPoster || backdropUrl
                : backdropUrl || displayPoster
            }
            alt={displayTitle || ""}
            className={`w-full h-full object-cover transition-all duration-[1500ms] ease-in-out ${
              isVideoReady && trailerUrl
                ? "opacity-30 scale-105"
                : "opacity-100 scale-100"
            }`}
            style={{
              filter: isVideoReady && trailerUrl ? "blur(20px)" : "none",
              objectPosition: isMobile ? "top center" : "center center",
            }}
          />

          {/* OVERLAY: Cinematic Video Loop Container - STRICTLY INVISIBLE UNTIL PLAYING */}
          {trailerUrl && (
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none transition-opacity duration-[2500ms] ease-out ${
                isVideoReady ? "opacity-100 active-video" : "opacity-0"
              }`}
            >
              {/* STABLE MOUNT POINT: Persistent to avoid race conditions */}
              <div id="hero-trailer-mount" className="video-background-cover" />
            </div>
          )}
        </div>

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/20 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 w-full z-20">
          <div
            className="px-6 md:px-12 pb-12 max-w-3xl space-y-4"
            style={{
              textShadow:
                "0 2px 6px rgba(0,0,0,0.65), 0 10px 28px rgba(0,0,0,0.75)",
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-xs md:text-sm text-gray-300 font-medium">
                {displayYear && <span>{displayYear}</span>}
                {rating > 0 && (
                  <span className="text-white">★ {rating.toFixed(1)}</span>
                )}
                <span className="uppercase tracking-widest">{mediaType}</span>
                {runtime && (
                  <span className="flex items-center gap-1.5 opacity-80">
                    <FaClock size={10} /> {formatRuntime(runtime)}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-6xl font-bold leading-tight tracking-tight">
                {displayTitle}
              </h1>
              {tagline && (
                <p className="text-sm md:text-base text-gray-300 italic">
                  "{tagline}"
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => {
                  if (isEpisodic) {
                    // Use selectedSeason (which updates on dropdown change)
                    // and prioritize history episode if it's the same season
                    const s = selectedSeason;
                    const e =
                      historyItem?.season === s ? historyItem?.episode || 1 : 1;

                    navigate(
                      `/watch/${mediaType}/${id}?season=${s}&episode=${e}`,
                    );
                  } else {
                    navigate(`/watch/${mediaType}/${id}`);
                  }
                }}
                className="btn-watch flex items-center gap-2"
              >
                <FaPlay size={14} />
                {progress > 0 ? "Resume" : "Play Now"}
              </button>

              <button
                onClick={() =>
                  inList ? remove(id) : add({ id, title, posterUrl, mediaType })
                }
                className={`btn-wishlist px-6 py-3 rounded-lg border border-white/35 backdrop-blur-2xl flex items-center gap-2 transition-all duration-300 ease-out hover:-translate-y-[1px] hover:border-white/60 ${inList ? "bg-red-600/20 border-red-600/50 text-red-100" : "bg-gradient-to-b from-white/15 via-white/10 to-black/50"}`}
              >
                {inList ? <FaHeart /> : <FaPlus />}
                {inList ? "Pinned" : "Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative z-30 px-6 md:px-12 -mt-8 md:-mt-8 pb-6 space-y-10 bg-black">
        <section className="max-w-3xl mt-6 space-y-2">
          <div className="flex items-center gap-4">
            <h2 className="text-sm md:text-lg font-bold uppercase tracking-[0.2em] text-blue-500">
              Overview
            </h2>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>
          <div className="relative">
            <p
              className={`text-gray-200 text-sm md:text-base leading-relaxed font-medium ${!isExpanded ? "line-clamp-3" : ""}`}
            >
              {displayOverview}
            </p>
            {overview?.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-white/50 font-black text-xs md:text-sm hover:text-white transition-colors underline whitespace-nowrap"
              >
                {isExpanded ? "READ LESS" : "READ MORE"}
              </button>
            )}
          </div>
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-gray-400"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </section>

        {isEpisodic && (
          <section className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
              <div className="flex items-center gap-6">
                <h2 className="text-xl md:text-4xl font-bold tracking-tight">
                  Episodes
                </h2>
                {number_of_seasons >= 1 && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsSeasonDropdownOpen(!isSeasonDropdownOpen)
                      }
                      className="flex items-center justify-between w-44 md:w-56 bg-[#111] border border-white/10 rounded-xl px-5 py-2.5 font-bold text-sm md:text-base hover:border-blue-500/50 transition-all cursor-pointer group"
                    >
                      <span className="truncate">
                        {seasons.find((s) => s.season_number === selectedSeason)
                          ?.name || `Season ${selectedSeason}`}
                      </span>
                      <FaChevronDown
                        className={`transition-transform duration-300 text-gray-500 text-xs ${isSeasonDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isSeasonDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-[60]"
                          onClick={() => setIsSeasonDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[70] animate-fadeIn">
                          <div className="max-h-64 overflow-y-auto py-2 scroll-prominent">
                            {(seasons.length > 0
                              ? seasons
                              : Array.from(
                                  { length: number_of_seasons },
                                  (_, i) => ({
                                    season_number: i + 1,
                                    name: `Season ${i + 1}`,
                                    id: i + 1,
                                  }),
                                )
                            )
                              .filter((s) => s.season_number > 0)
                              .map((s) => (
                                <button
                                  key={s.id || s.season_number}
                                  onClick={() => {
                                    handleSeasonChange(s.season_number);
                                    setIsSeasonDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-5 py-3.5 text-sm md:text-base font-bold transition-all hover:bg-white/5 border-l-2 ${
                                    selectedSeason === s.season_number
                                      ? "text-blue-500 bg-blue-500/5 border-blue-500"
                                      : "text-gray-400 border-transparent hover:text-gray-200"
                                  }`}
                                >
                                  {s.name || `Season ${s.season_number}`}
                                </button>
                              ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="h-[1px] flex-1 bg-white/10 hidden md:block" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
              {loadingSeason
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-video bg-white/5 rounded-2xl animate-pulse"
                    />
                  ))
                : seasonData?.episodes?.slice(0, visibleEpisodes).map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() =>
                        navigate(
                          `/watch/${mediaType}/${id}?season=${selectedSeason}&episode=${ep.episodeNumber}`,
                        )
                      }
                      className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={
                            ep.stillUrl ||
                            "https://via.placeholder.com/300x169/000000/FFFFFF?text=Stream24"
                          }
                          alt={ep.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-blue-600/90 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                            <FaPlay className="text-white ml-1" size={16} />
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-black uppercase tracking-wider">
                            EP {ep.episodeNumber}
                          </span>
                          {ep.runtime && (
                            <span className="text-[10px] font-bold text-white/70 bg-black/40 px-1.5 rounded backdrop-blur-sm">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 space-y-1 bg-gradient-to-b from-transparent to-black/20">
                        <h3 className="font-bold text-sm md:text-base line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {ep.name}
                        </h3>
                        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium">
                          {ep.overview || "No description available."}
                        </p>
                      </div>
                    </div>
                  ))}
            </div>
            {seasonData?.episodes?.length > visibleEpisodes && (
              <div className="flex justify-center pt-10">
                <button
                  onClick={() => setVisibleEpisodes((prev) => prev + 8)}
                  className="px-8 py-3 rounded-full border border-white/10 bg-white/5 font-bold text-sm tracking-widest uppercase hover:bg-white/10 hover:border-blue-500/50 transition-all text-gray-400 hover:text-white"
                >
                  Load More Episodes
                </button>
              </div>
            )}
          </section>
        )}

        {cast.length > 0 && (
          <section className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">
                Cast & Crew
              </h2>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-28 md:w-44">
                  <PersonCard person={person} width="100%" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .video-background-cover {
          position: absolute; top: 50%; left: 50%;
          width: 100%; height: 56.25vw;
          min-width: 177.77vh; min-height: 100vh;
          transform: translate(-50%, -50%) scale(1.15);
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .video-background-cover {
            width: 300%; height: 100vh; min-height: 110vh;
            transform: translate(-50%, -50%) scale(1.2);
            filter: brightness(0.8) contrast(1.1);
          }
        }
      `,
        }}
      />
    </div>
  );
}

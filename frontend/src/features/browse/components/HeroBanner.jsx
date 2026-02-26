import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../wishlist/context/WishlistContext";
import { FaHeart, FaPlus, FaPlay } from "react-icons/fa";
import { fetchWatchHistory } from "../../watch-history/services/watchHistory.service";

const HeroSkeleton = () => {
  return (
    <section className="relative w-full bg-black overflow-hidden">
      {/* ── MOBILE ── */}
      <div className="relative aspect-[2/3] md:hidden overflow-hidden">
        {/* Shimmer backdrop */}
        <div className="skeleton absolute inset-0 rounded-none" />
        {/* Gradient fade so content skeleton is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Content skeleton anchored to bottom */}
        <div className="absolute bottom-0 left-0 w-full px-5 pb-10 space-y-3">
          {/* Title — wide bar */}
          <div className="hero-skeleton-block h-7 w-3/4 rounded-md" />
          {/* Title second line — shorter */}
          <div className="hero-skeleton-block h-7 w-1/2 rounded-md" />

          {/* Meta chips row */}
          <div className="flex gap-2 pt-1">
            <div className="hero-skeleton-block h-4 w-10 rounded-full" />
            <div className="hero-skeleton-block h-4 w-12 rounded-full" />
            <div className="hero-skeleton-block h-4 w-14 rounded-full" />
          </div>

          {/* Description lines */}
          <div className="space-y-1.5 pt-1">
            <div className="hero-skeleton-block h-3 w-full rounded" />
            <div className="hero-skeleton-block h-3 w-5/6 rounded" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <div className="hero-skeleton-block h-10 w-28 rounded-lg" />
            <div className="hero-skeleton-block h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block relative h-[88vh] overflow-hidden">
        {/* Shimmer backdrop */}
        <div className="skeleton absolute inset-0 rounded-none" />
        {/* Directional gradient overlays — same as real hero */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

        {/* Content skeleton anchored to bottom-left */}
        <div className="absolute bottom-0 left-0 px-12 pb-14 space-y-4 max-w-2xl">
          {/* Title — two lines */}
          <div className="hero-skeleton-block h-12 w-[420px] rounded-lg" />
          <div className="hero-skeleton-block h-12 w-[280px] rounded-lg" />

          {/* Meta chips */}
          <div className="flex gap-3 pt-1">
            <div className="hero-skeleton-block h-5 w-12 rounded-full" />
            <div className="hero-skeleton-block h-5 w-14 rounded-full" />
            <div className="hero-skeleton-block h-5 w-16 rounded-full" />
          </div>

          {/* Description — 3 lines */}
          <div className="space-y-2 pt-1">
            <div className="hero-skeleton-block h-4 w-[480px] rounded" />
            <div className="hero-skeleton-block h-4 w-[420px] rounded" />
            <div className="hero-skeleton-block h-4 w-[300px] rounded" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-3">
            <div className="hero-skeleton-block h-12 w-32 rounded-lg" />
            <div className="hero-skeleton-block h-12 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroBanner = ({ movie, heroPool = [], loadingOverride }) => {
  const navigate = useNavigate();
  const { add, remove, exists } = useWishlist();

  const pool = heroPool.length > 0 ? heroPool : movie ? [movie] : [];

  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [progressMap, setProgressMap] = useState({});

  // Fetch history to check for resume progress
  useEffect(() => {
    let mounted = true;
    fetchWatchHistory()
      .then((history) => {
        if (mounted && history) {
          const map = {};
          history.forEach((h) => {
            map[h.contentId] = h.progress;
          });
          setProgressMap(map);
        }
      })
      .catch(() => {
        // Silent fail (user might be guest)
      });
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (pool.length <= 1) return;

    const interval = setInterval(() => {
      setPrevIndex(index);
      setIndex((prev) => (prev + 1) % pool.length);
      setAnimKey((k) => k + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, [index, pool.length]);

  if (!pool.length || loadingOverride) return <HeroSkeleton />;

  const current = pool[index];
  const previous = pool[prevIndex];
  const inList = exists(current?.id);
  const progress = progressMap[current?.id] || 0;

  const toggleWishlist = () => {
    if (!current) return;
    if (inList) {
      remove(current.id);
    } else {
      add({
        id: current.id,
        title: current.title,
        posterUrl: current.posterUrl,
        backdropUrl: current.backdropUrl,
        mediaType: current.mediaType || "movie",
      });
    }
  };

  const handleView = () => {
    navigate(`/details/${current.mediaType}/${current.id}`);
  };

  const renderLayer = (item, type) => {
    const imageUrl = item.posterUrl || item.backdropUrl;

    return (
      <div
        key={item.id + type + animKey}
        className={`hero-layer ${type} cinematic-dissolve`}
      >
        {/* Ken Burns ONLY here */}
        <div
          className="absolute inset-0 bg-top bg-cover hero-bg-animate"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />

        {/* Overlays unchanged */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_40%,rgba(0,0,0,0.35)_100%)]" />
      </div>
    );
  };

  return (
    <section className="relative w-full bg-black text-white overflow-hidden">
      {/* Transition animation only (safe properties only) */}
      <style>{`
        .cinematic-dissolve {
          animation: cinematicDissolve 900ms ease-out;
          will-change: opacity, filter;
        }

        @keyframes cinematicDissolve {
          0% {
            opacity: 0;
            filter: blur(10px) brightness(0.9);
          }
          60% {
            opacity: 1;
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>

      {/* ================= MOBILE ================= */}
      <div className="relative aspect-[2/3] md:hidden overflow-hidden">
        {renderLayer(previous, "exit")}
        {renderLayer(current, "enter")}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block relative h-[88vh] overflow-hidden">
        <div key={current.id} className="absolute inset-0 cinematic-dissolve">
          <img
            src={current.backdropUrl || current.posterUrl}
            alt={current.title}
            className="w-full h-full object-cover object-top hero-bg-animate scale-[1.02]"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="absolute bottom-0 left-0 w-full">
        <div
          className="px-5 md:px-12 pb-12 max-w-3xl space-y-4 hero-text"
          style={{
            textShadow:
              "0 2px 6px rgba(0,0,0,0.65), 0 10px 28px rgba(0,0,0,0.75)",
          }}
        >
          <h1 className="text-3xl md:text-6xl font-bold leading-tight tracking-tight">
            {current.title}
          </h1>

          <div className="flex gap-4 text-xs md:text-sm text-gray-300 font-medium">
            {current.year && <span>{current.year}</span>}
            {current.rating && <span>★ {current.rating.toFixed(1)}</span>}
            <span className="uppercase">{current.mediaType}</span>
          </div>

          <p className="text-gray-200 text-sm md:text-base leading-relaxed line-clamp-3">
            {current.overview}
          </p>

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleView}
              className="btn-watch flex items-center gap-2"
            >
              <FaPlay className="text-sm" />
              {progress > 0 ? "Resume" : "View"}
            </button>

            <button
              onClick={toggleWishlist}
              className={`
                btn-wishlist btn-glass
                border border-white/35
                backdrop-blur-2xl
                px-6 py-3 rounded-lg
                transition-all duration-300 ease-out
                hover:-translate-y-[1px]
                hover:border-white/60
                flex items-center gap-2
                ${inList ? "bg-red-600 from-white/15 via-white/10 to-black/50" : "bg-gradient-to-b from-white/15 via-white/10 to-black/50"}
              `}
            >
              {inList ? <FaHeart /> : <FaPlus />}
              {inList ? "Pinned" : "My List"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;

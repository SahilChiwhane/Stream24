import React, { useMemo, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarouselScroll } from "../hooks/useCarouselScroll";
import Card from "./Card";

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[160px] h-[240px] rounded-2xl skeleton bg-neutral-900" />
);

const Carousel = ({
  title,
  items = [],
  loading = false,
  suppressSkeletons = false,
  onRemove,
  isResume = false,
  showRank = false,
}) => {
  const { rowRef, canLeft, canRight, scroll } = useCarouselScroll();

  const skeletons = useMemo(() => Array.from({ length: 10 }), []);

  // Guard: Hide entirely if empty (not loading) OR if loading but skeletons are suppressed
  if ((!loading && items.length === 0) || (loading && suppressSkeletons)) {
    return null;
  }

  const showSkeleton = loading && !suppressSkeletons;

  return (
    <section className="relative w-full my-14 carousel-shell group">
      {/* Title */}
      <div className="px-5 md:px-12 mb-4">
        <h2 className="text-[22px] font-semibold tracking-tight text-white/90">
          {title}
        </h2>
      </div>

      <div className="relative mx-5 md:mx-12 rounded-3xl overflow-hidden carousel-mask">
        {/* Left Arrow (desktop + hover only) */}
        {!showSkeleton && canLeft && (
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="
              absolute left-2 top-1/2 -translate-y-1/2 z-40
              w-12 h-12 rounded-full
              bg-black/80 backdrop-blur-xl
              border border-white/10
              grid place-items-center
              transition-all duration-300
              hover:scale-110 hover:bg-black
              opacity-0 group-hover:opacity-100
              hidden lg:grid
            "
          >
            <ChevronLeft className="text-white w-6 h-6" />
          </button>
        )}

        {/* Right Arrow (desktop + hover only) */}
        {!showSkeleton && canRight && (
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="
              absolute right-2 top-1/2 -translate-y-1/2 z-40
              w-12 h-12 rounded-full
              bg-black/80 backdrop-blur-xl
              border border-white/10
              grid place-items-center
              transition-all duration-300
              hover:scale-110 hover:bg-black
              opacity-0 group-hover:opacity-100
              hidden lg:grid
            "
          >
            <ChevronRight className="text-white w-6 h-6" />
          </button>
        )}

        <div
          ref={rowRef}
          className="
            carousel-row
            flex gap-4 px-0 py-6
            overflow-x-auto overflow-y-visible
            scroll-smooth
            scrollbar-hide
          "
        >
          {showSkeleton
            ? skeletons.map((_, i) => <SkeletonCard key={i} />)
            : items.map((item, i) => (
                <div
                  key={item.historyId || item.id}
                  className="carousel-card-wrapper flex-shrink-0"
                >
                  <Card
                    movie={item}
                    rank={showRank ? i + 1 : undefined}
                    onRemove={onRemove}
                    isResume={isResume}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default memo(Carousel);

import { useWishlist } from "../../wishlist/context/WishlistContext";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaTrash } from "react-icons/fa";

const Card = ({
  movie,
  width = 160,
  hideTitle = false,
  mediaType,
  rank,
  onRemove,
  isResume,
}) => {
  const { exists, add, remove } = useWishlist();
  const navigate = useNavigate();

  const inList = exists(movie?.id);

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!movie?.id) return;

    if (inList) {
      remove(movie.id);
    } else {
      add({
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        mediaType: mediaType || movie.mediaType || "movie",
      });
    }
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (onRemove && movie.historyId) {
      onRemove(movie.historyId);
    }
  };

  let resolvedType = mediaType || movie.mediaType || "movie";
  // Normalize for backend which accepts "movie" or "tv"
  if (resolvedType === "series" || resolvedType === "anime") {
    resolvedType = "tv"; // Assuming anime is mostly TV series in this context
  }

  const handleNav = () => {
    if (!movie?.id) return;

    const sp = new URLSearchParams();
    if (movie.season) sp.append("season", movie.season);
    if (movie.episode) sp.append("episode", movie.episode);
    const query = sp.toString() ? `?${sp.toString()}` : "";

    // For "Continue Watching", navigate directly to the player
    if (
      isResume ||
      (typeof movie.progress === "number" && movie.progress > 0)
    ) {
      navigate(`/watch/${resolvedType}/${movie.id}${query}`);
      return;
    }

    navigate(`/details/${resolvedType}/${movie.id}${query}`);
  };

  const poster =
    movie?.posterUrl || "https://via.placeholder.com/300x450?text=No+Image";

  return (
    <div
      onClick={handleNav}
      tabIndex={0}
      role="button"
      aria-label={`Open ${movie?.title}`}
      className="group relative cursor-pointer outline-none overflow-visible rounded-2xl focus-visible:ring-2 focus-visible:ring-red-500/40 md:transform md:transition-all md:duration-200 md:hover:scale-105"
      style={{ width }}
    >
      {/* Clip container with buffer (this prevents seam) */}
      <div className="relative overflow-hidden rounded-2xl bg-black p-[1px]">
        <div className="relative overflow-hidden rounded-[15px] bg-black aspect-[2/3]">
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />

          {/* ... (rank and title bits) */}
          {typeof rank === "number" && (
            <div className="absolute top-2 left-2 z-20 w-7 h-7 grid place-items-center bg-red-600 text-white text-xs font-bold rounded-full shadow">
              #{rank}
            </div>
          )}

          {!hideTitle && (
            <div
              className="
                absolute bottom-0 left-0 right-0
                h-[72px]
                bg-gradient-to-t
                from-black/80 via-black/40 to-transparent
                md:from-black/90 md:via-black/60
                flex items-end justify-start
                px-4 pb-3
              "
            >
              <div className="w-full">
                <p
                  className="
                    text-white text-[13px] font-medium tracking-wide
                    line-clamp-2 mb-1
                  "
                  style={{
                    textShadow: "0 2px 6px rgba(0,0,0,0.85)",
                  }}
                >
                  {movie.title}
                </p>

                {/* Progress Bar - Only if valid progress exists */}
                {typeof movie.progress === "number" &&
                  typeof movie.duration === "number" &&
                  movie.duration > 0 && (
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1 relative z-10">
                      <div
                        className="h-full bg-red-600 rounded-full"
                        style={{
                          width: `${movie.progress / movie.duration >= 0.95 ? 100 : Math.max(3, Math.min(100, (movie.progress / movie.duration) * 100))}%`,
                        }}
                      />
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Container */}
      <div className="absolute top-2 right-2 z-50 flex flex-col gap-2">
        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          aria-label={inList ? "Remove from wishlist" : "Add to wishlist"}
          className="
            wishlist-btn
            w-8 h-8 rounded-full
            bg-black/70 backdrop-blur-xl
            border border-white/10
            grid place-items-center
            transition-all duration-300
            md:hover:scale-105 md:hover:bg-black/90
            focus-visible:ring-2 focus-visible:ring-red-500/40
            opacity-100 md:opacity-0 md:group-hover:opacity-100
          "
        >
          {inList ? (
            <FaHeart className="text-red-500 text-sm drop-shadow" />
          ) : (
            <FaRegHeart className="text-white text-sm drop-shadow" />
          )}
        </button>

        {/* Remove Button (Continue Watching specific) */}
        {onRemove && movie.historyId && (
          <button
            onClick={handleRemove}
            aria-label="Delete watch history"
            className="
              remove-btn
              w-8 h-8 rounded-full
              bg-black/70 backdrop-blur-xl
              border border-white/10
              grid place-items-center
              transition-all duration-300
              md:hover:scale-105 md:hover:bg-black/90 md:hover:border-red-500/50
              focus-visible:ring-2 focus-visible:ring-red-500/40
              opacity-100 md:opacity-0 md:group-hover:opacity-100
            "
          >
            <FaTrash className="text-white md:hover:text-red-500 text-xs transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Card;

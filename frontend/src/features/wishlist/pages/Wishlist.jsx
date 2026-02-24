import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { Trash2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../../../shared/components/EmptyState";

const Wishlist = () => {
  const { items, remove, loaded } = useWishlist();

  if (!loaded) {
    return (
      <div className="w-full min-h-screen bg-black text-white px-6 py-8">
        <div className="mb-8 animate-wishlist-header">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Your <span className="text-[#3B82F6]">Wishlist</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400">
            Loading your saved titles...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white px-6 py-8">
      {/* ===== Smooth Animated Header ===== */}
      <div className="mb-8 animate-wishlist-header">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Your <span className="text-[#3B82F6]">Wishlist</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-400">
          Movies and shows you love, saved for later.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save your favorite movies and shows here to watch them later. Start exploring our catalog to find something you love."
          actionLabel="Explore Movies"
          actionLink="/movies"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {items.map((movie) => {
            const poster =
              movie.posterUrl ||
              "https://via.placeholder.com/300x450?text=No+Image";

            const title = (movie.title || "Untitled").trim();

            return (
              <div
                key={movie.id}
                className="relative group cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-2xl rounded-lg overflow-hidden max-w-[150px] w-full mx-auto"
                aria-label={title}
                role="article"
                tabIndex={0}
                title={title}
              >
                <img
                  src={poster}
                  alt={title}
                  className="w-[150px] h-[225px] block object-cover"
                  loading="lazy"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(movie.id);
                  }}
                  aria-label={`Remove ${title} from wishlist`}
                  className="absolute top-2 right-2 bg-black/60 p-2 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 z-20"
                >
                  <Trash2 size={18} className="text-white" />
                </button>

                <div
                  className="absolute left-0 right-0 bottom-0 p-2"
                  style={{ pointerEvents: "none" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                  <div className="relative w-full h-20 flex items-end justify-center" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== Smooth header animation ===== */}
      <style>{`
        @keyframes wishlistHeaderIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-wishlist-header {
          animation: wishlistHeaderIn 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
};

export default Wishlist;

import React from "react";
import HeroBanner from "../components/HeroBanner";
import Carousel from "../components/Carousel";
import { useMoviesFeed } from "../hooks/useMoviesFeed";
import ResumeWatching from "../../home/components/ResumeWatching";

const Movies = () => {
  const {
    hero,
    heroPool,
    trending,
    newOn,
    topRated,
    comingSoon,
    loading,
    error,
  } = useMoviesFeed();

  return (
    <main className="bg-black text-white min-h-screen">
      <HeroBanner movie={hero} heroPool={heroPool} loadingOverride={loading} />

      {error && (
        <div className="px-5 md:px-12 py-6 text-red-400">
          Failed to load content. Check connection.
        </div>
      )}

      <div className="pb-10 space-y-6">
        <ResumeWatching />
        <Carousel
          title="Trending Now"
          items={trending}
          loading={loading}
          showRank={true}
        />
        <Carousel
          title="New on Stream24"
          items={newOn || []}
          loading={loading}
          suppressSkeletons={true}
        />
        <Carousel
          title="Top Rated Movies"
          items={topRated || []}
          loading={loading}
        />
        <Carousel
          title="Coming Soon"
          items={comingSoon || []}
          loading={loading}
        />
      </div>
    </main>
  );
};

export default Movies;

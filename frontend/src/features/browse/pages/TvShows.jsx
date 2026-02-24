import React from "react";
import HeroBanner from "../components/HeroBanner";
import Carousel from "../components/Carousel";
import { useTvFeed } from "../hooks/useTvFeed";
import ResumeWatching from "../../home/components/ResumeWatching";

const TvShows = () => {
  const {
    hero,
    heroPool,
    trending,
    popular,
    topRated,
    airing,
    loading,
    error,
  } = useTvFeed();

  return (
    <main className="bg-black text-white min-h-screen">
      <HeroBanner movie={hero} heroPool={heroPool} loadingOverride={loading} />

      {error && (
        <div className="px-5 md:px-12 py-6 text-red-400">
          Failed to load TV shows. Check connection.
        </div>
      )}

      <div className="pb-10 space-y-6">
        <ResumeWatching />
        <Carousel
          title="Trending TV Shows"
          items={trending}
          loading={loading}
          showRank={true}
        />
        <Carousel title="Popular Shows" items={popular} loading={loading} />
        <Carousel title="Top Rated Shows" items={topRated} loading={loading} />
        <Carousel title="Currently Airing" items={airing} loading={loading} />
      </div>
    </main>
  );
};

export default TvShows;

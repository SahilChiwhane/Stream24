import React from "react";
import HeroBanner from "../components/HeroBanner";
import Carousel from "../components/Carousel";
import { useAnimeFeed } from "../hooks/useAnimeFeed";
import ResumeWatching from "../../home/components/ResumeWatching";

const Anime = () => {
  const {
    hero,
    heroPool,
    popular,
    topRated,
    shonen,
    series,
    animeComedy,
    movies,
    loading,
    error,
  } = useAnimeFeed();

  return (
    <main className="bg-black text-white min-h-screen">
      <HeroBanner movie={hero} heroPool={heroPool} loadingOverride={loading} />

      {error && (
        <div className="px-5 md:px-12 py-6 text-red-400">
          Failed to load anime feed. Check connection.
        </div>
      )}

      <div className="pb-10 space-y-6">
        <ResumeWatching />
        <Carousel
          title="Popular Anime"
          items={popular}
          loading={loading}
          showRank={true}
        />
        <Carousel title="Top Rated Anime" items={topRated} loading={loading} />
        <Carousel title="Shonen & Action" items={shonen} loading={loading} />
        <Carousel title="Anime Series" items={series} loading={loading} />
        <Carousel
          title="Comedy Classics"
          items={animeComedy}
          loading={loading}
        />
        <Carousel title="Anime Movies" items={movies} loading={loading} />
      </div>
    </main>
  );
};

export default Anime;

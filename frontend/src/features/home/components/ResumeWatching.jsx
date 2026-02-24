import React from "react";
import { useLocation } from "react-router-dom";
import { useWatchHistory } from "../../../features/watch-history/context/WatchHistoryContext";
import Carousel from "../../browse/components/Carousel";

export default function ResumeWatching() {
  const { history, loading, removeFromHistory, refresh } = useWatchHistory();
  const location = useLocation();
  const isAnimePage = location.pathname.includes("/anime");

  // Industrial Refresh: Re-sync on mount to ensure latest progress is visible
  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleRemove = async (historyId) => {
    try {
      await removeFromHistory(historyId);
    } catch (err) {
      console.error("Failed to remove history item:", err);
    }
  };

  if (loading) {
    return (
      <Carousel
        title="Continue Watching"
        items={[]}
        loading={true}
        isResume={true}
      />
    );
  }

  if (!history || history.length === 0) return null;

  const mapped = history.reduce((acc, i) => {
    // 1. Structural Filtering: Removed (All content type visibility)
    const itemIsAnime =
      i.contentType === "anime" ||
      i.isAnime === true ||
      i.isAnime === "true" ||
      String(i.mediaType).toLowerCase().includes("anime");

    // 2. Calculate duration and progress
    // Priority: Saved duration (real video) > Runtime seconds > Metadata runtime
    const dur =
      i.durationSeconds ||
      i.runtimeSeconds ||
      (i.runtime ? i.runtime * 60 : null);

    // hasDuration > 0 ensures short videos like trailers don't have their progress zeroed out
    const hasDuration = dur && dur > 0;
    const ratio = hasDuration ? i.progress / dur : 0;
    const remaining = hasDuration ? dur - i.progress : Infinity;

    // Completion logic: If > 95% finished OR strictly within 10s of the end
    const isCompleted =
      hasDuration && (ratio >= 0.95 || (dur > 10 && remaining < 10));
    const isTooEarly = i.progress < 1.5;

    // 3. Filter out completed or transient watch sessions
    if (isCompleted || isTooEarly) {
      return acc;
    }

    // 4. De-duplicate: Only keep the most recent entry for each contentId
    const existingIndex = acc.findIndex(
      (item) => String(item.id) === String(i.contentId),
    );
    if (existingIndex !== -1) return acc;

    const isEpisodic = ["tv", "series", "anime"].includes(
      String(i.contentType || i.mediaType).toLowerCase(),
    );
    const displayTitle =
      isEpisodic && i.season && i.episode
        ? `${i.title} (S${i.season} E${i.episode})`
        : i.title;

    acc.push({
      id: i.contentId,
      historyId: i.id,
      title: displayTitle,
      posterUrl: i.thumbnail || i.posterUrl,
      mediaType: i.contentType || i.mediaType || "movie",
      isAnime: itemIsAnime,
      season: i.season,
      episode: i.episode,
      progress: i.progress,
      // Fallback for UI if duration is unknown (1.5m baseline for trailers)
      duration: dur || 90,
    });

    return acc;
  }, []);

  if (mapped.length === 0) {
    return null;
  }

  return (
    <div className="resume-watching-section">
      <Carousel
        title="Continue Watching"
        items={mapped}
        loading={false}
        isResume={true}
        onRemove={handleRemove}
      />
    </div>
  );
}

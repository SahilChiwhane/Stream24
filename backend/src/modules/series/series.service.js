import { firestore } from "../../config/firebase.js";

const seriesRef = firestore.collection("series_meta");

export const resolveNextEpisode = async ({
  seriesId,
  season,
  episode,
}) => {
  const snap = await seriesRef.doc(seriesId).get();

  if (!snap.exists) {
    throw new Error("Series metadata not found");
  }

  const data = snap.data();
  const seasons = data.seasons;

  const totalEpisodesInSeason = seasons[String(season)];

  // ▶️ Next episode in same season
  if (episode < totalEpisodesInSeason) {
    return {
      hasNext: true,
      next: {
        seriesId,
        season,
        episode: episode + 1,
      },
    };
  }

  // 🔁 Move to next season
  const nextSeason = season + 1;
  if (seasons[String(nextSeason)]) {
    return {
      hasNext: true,
      next: {
        seriesId,
        season: nextSeason,
        episode: 1,
      },
    };
  }

  // 🏁 Series completed
  return {
    hasNext: false,
    seriesCompleted: true,
  };
};

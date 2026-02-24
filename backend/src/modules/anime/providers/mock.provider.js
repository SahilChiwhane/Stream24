import { AnimeProvider } from "./anime.provider.interface.js";

const DEMO_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export class MockAnimeProvider extends AnimeProvider {
  async getHome() {
    return {
      spotlight: [
        {
          id: "anime_1",
          title: "Demon Slayer (Demo)",
          poster: "https://placehold.co/300x450",
        },
      ],
      trending: [
        {
          id: "anime_2",
          title: "Attack on Titan (Demo)",
          poster: "https://placehold.co/300x450",
        },
      ],
      topAiring: [],
    };
  }

  async getList(type, page = 1) {
    return {
      page,
      results: [
        {
          id: "anime_1",
          title: "Demon Slayer (Demo)",
          poster: "https://placehold.co/300x450",
        },
        {
          id: "anime_2",
          title: "Attack on Titan (Demo)",
          poster: "https://placehold.co/300x450",
        },
      ],
    };
  }

  async getDetails(animeId) {
    return {
      id: animeId,
      title:
        animeId === "anime_1"
          ? "Demon Slayer (Demo)"
          : "Attack on Titan (Demo)",
      description: "This is demo anime metadata for portfolio purposes.",
      genres: ["Action", "Shounen"],
      year: 2024,
    };
  }

  async getEpisodes(animeId) {
    return [
      { id: `${animeId}_ep1`, number: 1, title: "Episode 1" },
      { id: `${animeId}_ep2`, number: 2, title: "Episode 2" },
    ];
  }

  async getStream(episodeId) {
    return {
      episodeId,
      type: "mp4",
      url: DEMO_VIDEO,
      subtitles: [],
    };
  }

  async search(query, page = 1) {
    return {
      page,
      results: [
        { id: "anime_1", title: "Demon Slayer (Demo)" },
        { id: "anime_2", title: "Attack on Titan (Demo)" },
      ].filter((a) => a.title.toLowerCase().includes(query.toLowerCase())),
    };
  }
}

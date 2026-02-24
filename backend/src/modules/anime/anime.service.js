import { MockAnimeProvider } from "./providers/mock.provider.js";

const provider = new MockAnimeProvider();

export const getAnimeHome = () => provider.getHome();
export const getAnimeList = (type, page) => provider.getList(type, page);
export const getAnimeDetails = (id) => provider.getDetails(id);
export const getAnimeEpisodes = (id) => provider.getEpisodes(id);
export const getAnimeStream = (episodeId) => provider.getStream(episodeId);
export const searchAnime = (q, page) => provider.search(q, page);

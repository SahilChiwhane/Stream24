import { success, failure } from "../../utils/response.js";
import {
  getAnimeHome,
  getAnimeList,
  getAnimeDetails,
  getAnimeEpisodes,
  getAnimeStream,
  searchAnime,
} from "./anime.service.js";

export const home = async (req, res, next) => {
  try {
    const data = await getAnimeHome();
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

export const list = async (req, res, next) => {
  try {
    const { type } = req.params;
    const page = Number(req.query.page || 1);
    const data = await getAnimeList(type, page);
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

export const details = async (req, res, next) => {
  try {
    const data = await getAnimeDetails(req.params.id);
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

export const episodes = async (req, res, next) => {
  try {
    const data = await getAnimeEpisodes(req.params.id);
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

export const stream = async (req, res, next) => {
  try {
    const data = await getAnimeStream(req.params.episodeId);
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

export const search = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const page = Number(req.query.page || 1);
    const data = await searchAnime(q, page);
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

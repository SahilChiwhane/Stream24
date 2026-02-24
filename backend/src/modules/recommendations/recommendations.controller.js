import { success } from "../../utils/response.js";
import {
  buildMoviesHome,
  buildTvHome,
  buildAnimeHome,
} from "./recommendations.service.js";

export const moviesHome = async (req, res, next) => {
  try {
    const data = await buildMoviesHome();
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

export const tvHome = async (req, res, next) => {
  try {
    const data = await buildTvHome();
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

export const animeHome = async (req, res, next) => {
  try {
    const data = await buildAnimeHome();
    return success(res, data);
  } catch (e) {
    next(e);
  }
};

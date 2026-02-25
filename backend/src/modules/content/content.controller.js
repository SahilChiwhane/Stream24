import { success, failure } from "../../utils/response.js";
import {
  fetchMoviesHome,
  fetchTvHome,
  fetchAnimeHome,
  fetchDetails,
  fetchSeasonDetails,
} from "./content.service.js";
import logger from "../../utils/logger.js";

/* ======================================================
   MOVIES HOME
====================================================== */
export const getMoviesHome = async (req, res, next) => {
  try {
    const data = await fetchMoviesHome();
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   TV HOME
====================================================== */
export const getTvHome = async (req, res, next) => {
  try {
    const data = await fetchTvHome();
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   ANIME HOME
====================================================== */
export const getAnimeHome = async (req, res, next) => {
  try {
    const data = await fetchAnimeHome();
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   DETAILS
====================================================== */
export const getDetails = async (req, res, next) => {
  try {
    const { type, id } = req.params;

    // --- Input validation ---
    const allowedTypes = ["movie", "tv", "anime"];
    if (!allowedTypes.includes(type)) {
      return failure(res, "Invalid content type", 400);
    }

    if (!id || isNaN(Number(id))) {
      return failure(res, "Invalid content id", 400);
    }

    const data = await fetchDetails(type, id);

    if (!data) {
      return failure(res, "Content not found", 404);
    }

    return success(res, data);
  } catch (err) {
    next(err);
  }
};

/* ======================================================
   SEASON DETAILS
====================================================== */
export const getSeasonDetails = async (req, res, next) => {
  try {
    const { id, seasonNumber } = req.params;

    if (!id || isNaN(Number(id))) {
      return failure(res, "Invalid content id", 400);
    }

    if (!seasonNumber || isNaN(Number(seasonNumber))) {
      return failure(res, "Invalid season number", 400);
    }

    const data = await fetchSeasonDetails(id, seasonNumber);

    if (!data) {
      return failure(res, "Season not found", 404);
    }

    return success(res, data);
  } catch (err) {
    next(err);
  }
};

import { success, failure } from "../../utils/response.js";
import {
  resolveNextPlayback,
  resolveResumePlayback,
  resolveTrailer,
  searchYouTubeFallback,
  fetchTmdbTitle,
  validateYouTubeBulk,
  getLoopWindow,
} from "./playback.service.js";
import { resolvePlaybackAccess } from "./playback.resolve.js";
import { fetchDetails } from "../content/content.service.js";
import logger from "../../utils/logger.js";
import cache from "../../utils/cache.js";

export const resolvePlayback = async (req, res, next) => {
  try {
    const uid = req.user?.uid || "DEV_UID";
    const { contentId, contentType, season, episode } = req.body;

    if (!contentId || !contentType) {
      return failure(res, "contentId and contentType are required", 400);
    }

    const decision = await resolvePlaybackAccess({
      uid,
      contentId,
      contentType,
    });

    const previewMode = process.env.PREVIEW_MODE === "true";

    if (!decision.allowed && !previewMode) {
      return success(res, decision, "Playback blocked");
    }

    // --- CACHE LAYER (Industrial approach to reduce load time) ---
    const cacheKey = `playback_${contentType}_${contentId}_S${season || 0}_E${episode || 0}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      logger.playback(`Returning cached playback data for ${cacheKey}`);
      return success(
        res,
        {
          ...decision,
          ...cachedData,
        },
        "Playback resolved (CACHED)",
      );
    }

    let youtubeKey = null;
    let fallbacks = [];

    // --- Fetch Metadata for better discovery ---
    const details = await fetchDetails(contentType, contentId).catch(
      () => ({}),
    );
    const meta = {
      originalTitle: details.originalTitle,
      imdbId: details.external_ids?.imdb_id,
      year: details.year,
    };

    // --- MANUAL OVERRIDES (Hardcoded links for specific titles) ---
    const titleMatch = (details.title || details.name || "").toLowerCase();
    if (titleMatch.includes("death note")) {
      logger.playback(`Manual override triggered for: ${titleMatch}`);
      return success(
        res,
        {
          ...decision,
          allowed: true,
          playbackUrl: "https://www.youtube.com/watch?v=-W_7p9pL0y4",
          fallbackUrls: [
            "https://www.youtube.com/watch?v=NlJZ-YgAt-c",
            "https://www.youtube.com/watch?v=9xNH23QkNpk",
          ],
          loopWindow: { start: 5, end: 20 },
          mode: "preview",
        },
        "Playback resolved (MANUAL OVERRIDE)",
      );
    }

    if (titleMatch.includes("zootopia 2")) {
      logger.playback(`Manual override triggered for: ${titleMatch}`);
      return success(
        res,
        {
          ...decision,
          allowed: true,
          playbackUrl: "https://www.youtube.com/watch?v=5AwtptT8X8k",
          fallbackUrls: [],
          loopWindow: { start: 0, end: 15 },
          mode: "preview",
        },
        "Playback resolved (MANUAL OVERRIDE)",
      );
    }

    // ─── Layer 1: TMDB Videos (Primary - Exact Metadata Match) ───
    logger.playback(
      `Resolving: ${contentType} ${contentId} (S:${season} E:${episode})`,
    );
    const trailerData = await resolveTrailer(
      contentType,
      contentId,
      season,
      episode,
      meta,
    );

    youtubeKey = trailerData?.bestKey || null;
    fallbacks = trailerData?.fallbacks || [];
    let loopWindow = trailerData?.loopWindow || { start: 15, end: 30 };

    // ─── Layer 2: YouTube Search Fallback (Secondary) ───
    if (!youtubeKey) {
      logger.playback(
        "TMDB videos unavailable, attempting YouTube search fallback...",
      );
      const title =
        details.title || (await fetchTmdbTitle(contentType, contentId));
      const originalTitle = details.originalTitle;

      if (title) {
        const queries = [];

        // Strip fan subtitles for broader, more accurate official search
        // e.g. "28 Years Later: The Bone Temple" -> "28 Years Later"
        const cleanTitle = title.split(":")[0].split("-")[0].trim();

        let baseQuery = `${title}`;
        if (contentType === "tv" || contentType === "anime") {
          if (season && episode) {
            baseQuery += ` S${season}E${episode} full episode`;
          } else if (season) {
            baseQuery += ` Season ${season} official trailer`;
          } else {
            baseQuery += " official trailer";
          }
        } else {
          baseQuery += " official trailer";
          if (meta.year) baseQuery += ` ${meta.year}`;
        }
        if (contentType === "anime") baseQuery += " anime";
        baseQuery += " HD 1080p";

        // Strategy 1: The Clean Primary Search (Highest Success for Official Content)
        queries.push(`${cleanTitle} official trailer HD`);

        // Strategy 2: The Specific Title Search (Good for unique subtitles)
        queries.push(baseQuery);

        if (season && (contentType === "tv" || contentType === "anime")) {
          queries.push(`${cleanTitle} Season ${season} teaser HD`);
        }

        if (originalTitle && originalTitle !== title) {
          const cleanOriginal = originalTitle
            .split(":")[0]
            .split("-")[0]
            .trim();
          queries.push(`${cleanOriginal} official trailer PV HD`);
          if (contentType === "anime") {
            queries.push(`${cleanOriginal} PV 1 trailer`);
            queries.push(`${cleanOriginal} official teaser`);
          }
        }

        // Generic broad fallback
        queries.push(`${cleanTitle} official trailer`);

        for (const q of queries) {
          const searchData = await searchYouTubeFallback(q);
          if (searchData?.bestKey) {
            const validated = await validateYouTubeBulk([
              searchData.bestKey,
              ...(searchData.fallbacks || []),
            ]);
            if (validated.length > 0) {
              youtubeKey = validated[0];
              fallbacks = validated.slice(1);
              // Calculate loop window for the fallback key
              loopWindow = await getLoopWindow(youtubeKey);
              break;
            }
          }
        }
      }
    }

    const playbackUrl = youtubeKey
      ? `https://www.youtube.com/watch?v=${youtubeKey}`
      : null;

    const fallbackUrls = fallbacks.map(
      (key) => `https://www.youtube.com/watch?v=${key}`,
    );

    // --- Layer 3: Industrial Direct Stream Fallback (Guaranteed API) ---
    // We add Vidsrc as a high-quality fallback for movies and series
    const vidsrcId = meta.imdbId || contentId;
    if (vidsrcId) {
      const vidsrcUrl =
        contentType === "movie"
          ? `https://vidsrc.to/embed/movie/${vidsrcId}`
          : `https://vidsrc.to/embed/tv/${vidsrcId}/${season || 1}/${episode || 1}`;
      fallbackUrls.push(vidsrcUrl);
    }

    const playbackResult = {
      mode: "preview",
      playbackUrl:
        playbackUrl || (fallbackUrls.length > 0 ? fallbackUrls.shift() : null),
      fallbackUrls,
      loopWindow,
    };

    // Cache the resolved heavy-lifting for 2 hours
    cache.set(cacheKey, playbackResult, 7200);

    return success(res, {
      ...decision,
      ...playbackResult,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * AUTOPLAY / NEXT EPISODE
 */
export const getNextPlayback = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { type, contentType, contentId, seriesId, season, episode } =
      req.query;

    const finalType = type || contentType;

    if (!finalType) {
      return failure(res, "type is required", 400);
    }

    const result = await resolveNextPlayback({
      uid,
      contentType: finalType,
      contentId,
      seriesId,
      season: season ? Number(season) : null,
      episode: episode ? Number(episode) : null,
    });

    return success(res, result, "Next playback resolved");
  } catch (err) {
    next(err);
  }
};

/**
 * RESUME PLAYBACK
 */
export const resumePlayback = async (req, res, next) => {
  try {
    const uid = req.user.uid;
    const { contentId, season, episode } = req.query;

    if (!contentId) {
      return failure(res, "contentId is required", 400);
    }

    const result = await resolveResumePlayback({
      uid,
      contentId,
      season: season ? Number(season) : null,
      episode: episode ? Number(episode) : null,
    });

    return success(res, result, "Resume resolved");
  } catch (err) {
    next(err);
  }
};

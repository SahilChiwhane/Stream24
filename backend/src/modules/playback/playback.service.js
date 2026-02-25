import { firestore } from "../../config/firebase.js";
import fetch from "node-fetch";
import { normalizeContentType } from "../content/content.mapper.js";
import logger from "../../utils/logger.js";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  logger.warn(
    "YOUTUBE_API_KEY not set — YouTube search fallback will be disabled",
  );
}

// ================================
// TMDB CONFIG
// ================================
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY;

if (!TMDB_KEY) {
  logger.warn("TMDB_API_KEY not set — TMDB resolver will fail");
}

// ================================
// HELPERS
// ================================
const normalizeTmdbId = (id) => {
  if (!id) return null;
  if (id.startsWith("tmdb_")) return id.replace("tmdb_", "");
  return id;
};

const fetchSeasonFromTMDB = async (seriesId, season) => {
  const tmdbId = normalizeTmdbId(seriesId);

  const url = `${TMDB_BASE}/tv/${tmdbId}/season/${season}?api_key=${TMDB_KEY}`;
  logger.playback(`Fetching Season: ${url}`);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`TMDB season ${season} not found`);
  }

  return res.json();
};

// ================================
// YOUTUBE DURATION UTILS & LOOP CALC
// ================================
const parseDuration = (isoDuration) => {
  if (!isoDuration) return 0;
  // Format: PT#H#M#S
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = match && match[1] ? parseInt(match[1].replace("H", "")) : 0;
  const minutes = match && match[2] ? parseInt(match[2].replace("M", "")) : 0;
  const seconds = match && match[3] ? parseInt(match[3].replace("S", "")) : 0;

  return hours * 3600 + minutes * 60 + seconds;
};

export const getLoopWindow = async (videoId) => {
  const DEFAULT_WINDOW = { start: 15, end: 30 }; // Better default for trailers
  if (!YOUTUBE_API_KEY || !videoId) return DEFAULT_WINDOW;

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return DEFAULT_WINDOW;

    const data = await res.json();
    if (!data.items || data.items.length === 0) return DEFAULT_WINDOW;

    const isoDuration = data.items[0].contentDetails.duration;
    const duration = parseDuration(isoDuration);

    if (duration <= 15) return { start: 0, end: duration };

    // CINEMATIC PEAK LOGIC:
    // Most trailers have logos/slow starts in the first 25% and credits at the end.
    // The "meat" is usually between 50% and 80%.
    const cinematicPeak = duration * 0.65;

    // Ensure we skip at least the first 15% or 5s (whichever is more) to avoid studio logos
    const minStart = Math.max(5, duration * 0.15);

    let start = Math.floor(cinematicPeak - 7.5);

    // Safety Clamping
    if (start < minStart) start = minStart;

    let end = start + 15;

    // Outer Boundary Clamping
    if (end > duration - 1) {
      end = duration - 1;
      start = Math.max(0, end - 15);
    }

    logger.playback(
      `Loop Optimized (Cinematic Peak) - ID:${videoId} Duration:${duration}s Window:${start}-${end}`,
    );
    return { start, end };
  } catch (e) {
    logger.warn(`Loop Calculation failed for ${videoId}`);
    return DEFAULT_WINDOW;
  }
};

// ===============================
// GLOBAL VIDEO BLACKLIST (Strict)
// ===============================
const BLACKLISTED_VIDEOS = ["RsV4hjVZjos"];

// ===============================
// CONTENT SPECIFIC OVERRIDES
// ===============================
const CONTENT_OVERRIDES = {
  1272837: "EOwTdTZA8D8", // 28 Years Later: The Bone Temple
  124806: {
    1: "I6JIwjWOhnQ", // Solo Leveling Season 1
    2: "byJ7pxxhaDY", // Solo Leveling Season 2 (Arise From the Shadows)
    3: "0wbYmFwK5Xg", // Solo Leveling Season 3 (Teaser/PV)
  },
  127532: {
    1: "I6JIwjWOhnQ", // Solo Leveling Season 1
    2: "byJ7pxxhaDY", // Solo Leveling Season 2
    3: "0wbYmFwK5Xg", // Solo Leveling Season 3
  },
};

// ================================
// YOUTUBE DATA API v3 SEARCH FALLBACK
// ================================
export const searchYouTubeFallback = async (query) => {
  if (!YOUTUBE_API_KEY) {
    logger.warn("[PLAYBACK] No YOUTUBE_API_KEY — cannot search fallback");
    return null;
  }

  try {
    const searchQuery = encodeURIComponent(`${query} official trailer`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoEmbeddable=true&videoDefinition=high&order=relevance&maxResults=12&key=${YOUTUBE_API_KEY}`;

    logger.playback(
      `YouTube search fallback (Strict Refinement) for: ${query}`,
    );

    const res = await fetch(url);
    if (!res.ok) {
      logger.error(`YouTube search failed: ${res.status}`);
      return null;
    }

    const data = await res.json();
    let items = data?.items || [];

    // Filter out blacklisted videos
    items = items.filter(
      (item) => !BLACKLISTED_VIDEOS.includes(item.id.videoId),
    );

    if (items.length === 0) {
      logger.warn(`YouTube search returned no results for: ${query}`);
      return null;
    }

    // SCORING ENGINE for YouTube Results
    const scored = items.map((item) => {
      let score = 0;
      const title = item.snippet.title.toLowerCase();
      const channelTitle = item.snippet.channelTitle.toLowerCase();

      // A) Official Keywords Boost (Absolute Priority)
      if (title.includes("official")) score += 100000;
      if (title.includes("trailer")) score += 15000;
      if (title.includes("teaser")) score += 20000;
      if (title.includes("first look")) score += 25000;
      if (channelTitle.includes("official")) score += 150000;

      // B) Channel Trust (Studio Sovereign Boost)
      // Any video from these verified studios gets an automatic win over community content
      const studios = [
        "sony",
        "warner",
        "universal",
        "paramount",
        "disney",
        "netflix",
        "hbo",
        "a24",
        "marvel",
        "pixar",
        "trailers",
        "movieclips",
        "rotten tomatoes",
        "entertainment",
        "pictures",
        "studios",
        "focus features",
        "lionsgate",
        "amazon mgm",
      ];
      for (const s of studios) {
        if (channelTitle.includes(s)) score += 200000;
      }

      // Sony Pictures specific boost (Arbiter check for '28 Years Later' distributor)
      if (channelTitle.includes("sony pictures")) score += 300000;

      // C) UNOFFICIAL PURGE (CRITICAL)
      // Mathematically eliminate clickbait and fan concepts
      const badTerms = [
        "concept",
        "fan",
        "fanmade",
        "edited",
        "mashup",
        "ai",
        "tribute",
        "parody",
        "leak",
        "fake",
        "everything we know",
        "breakdown",
        "ending explained",
      ];
      for (const term of badTerms) {
        if (title.includes(term) || channelTitle.includes(term)) {
          score -= 500000;
        }
      }

      // D) Relevancy Check
      const queryWords = query.toLowerCase().split(" ");
      for (const word of queryWords) {
        if (title.includes(word)) score += 1000;
      }

      return { key: item.id.videoId, score };
    });

    const filtered = scored.sort((a, b) => b.score - a.score);
    const keys = filtered.map((s) => s.key);

    logger.playback(
      `YouTube Refinement: Found ${keys.length} scored candidates`,
    );

    return {
      bestKey: keys[0] || null,
      fallbacks: keys.slice(1),
    };
  } catch (err) {
    logger.error(`YouTube search error: ${err.message}`);
    return null;
  }
};

// ================================
// YOUTUBE DATA API VALIDATION (Bulk)
// ================================
/**
 * Validates a list of YouTube keys for embedding and region restrictions.
 */
export const validateYouTubeBulk = async (keys) => {
  if (!YOUTUBE_API_KEY || !keys.length) return keys;

  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=status,contentDetails&id=${keys.join(",")}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return keys;

    const data = await res.json();
    const items = data?.items || [];

    // Filter by embeddable status, region restriction, and force HD definition
    const validItems = items.filter((item) => {
      const isEmbeddable = item.status?.embeddable !== false;
      const definition = item.contentDetails?.definition; // 'hd' or 'sd'
      const restrictions = item.contentDetails?.regionRestriction;

      // Force high quality (HD) - User requirement
      if (definition !== "hd") return false;

      // If 'IN' (India) is blocked, skip it
      if (restrictions?.blocked?.includes("IN")) return false;
      // If 'allowed' list exists and doesn't include 'IN', skip it
      if (restrictions?.allowed && !restrictions.allowed.includes("IN"))
        return false;

      return isEmbeddable;
    });

    logger.playback(
      `YouTube Bulk check: ${validItems.length}/${items.length} videos passed HD/Region criteria`,
    );

    return validItems.map((item) => item.id);
  } catch (err) {
    logger.warn(`YouTube bulk validation failed: ${err.message}`);
    return keys;
  }
};

// ================================
// TRAILER RESOLVER
// ================================
export const resolveTrailer = async (
  contentType,
  contentId,
  season = null,
  episode = null,
  meta = {}, // { originalTitle, imdbId, year }
) => {
  try {
    const tmdbId = normalizeTmdbId(contentId);
    const normalizedType = normalizeContentType(contentType);

    if (!normalizedType) {
      logger.error("Invalid contentType:", contentType);
      return null;
    }

    // --- High-Priority Manual Overrides ---
    const override = CONTENT_OVERRIDES[String(tmdbId)];
    if (override) {
      let bestKey = typeof override === "string" ? override : null;

      // Handle seasonal overrides (for Anime/TV)
      if (typeof override === "object" && season) {
        bestKey = override[Number(season)] || null;
      }

      if (bestKey) {
        logger.playback(
          `Priority Override Match Found for [${tmdbId}] ${season ? `S${season}` : ""}: ${bestKey}`,
        );
        const loopWindow = await getLoopWindow(bestKey);
        return {
          bestKey,
          fallbacks: [],
          loopWindow,
        };
      }
    }

    // --- Discover all possible video sources from TMDB ---
    // We fetch in multiple languages for better coverage (especially for Anime)
    const languages = ["en-US", "ja-JP", "null"]; // ja-JP is crucial for Anime
    const videoPool = [];

    const fetchSources = async (targetUrl) => {
      try {
        const res = await fetch(targetUrl);
        if (res.ok) {
          const data = await res.json();
          videoPool.push(...(data?.results || []));
        }
      } catch (e) {}
    };

    const targetPaths = [];
    if (normalizedType === "tv" && season && episode) {
      targetPaths.push(
        `/tv/${tmdbId}/season/${season}/episode/${episode}/videos`,
      );
    }
    targetPaths.push(`/${normalizedType}/${tmdbId}/videos`);

    const fetchTasks = [];
    for (const path of targetPaths) {
      for (const lang of languages) {
        const langQuery = lang !== "null" ? `&language=${lang}` : "";
        fetchTasks.push(
          fetchSources(`${TMDB_BASE}${path}?api_key=${TMDB_KEY}${langQuery}`),
        );
      }
    }
    await Promise.allSettled(fetchTasks);

    // Filter and Deduplicate
    const uniqueVideos = Array.from(
      new Map(
        videoPool
          .filter(
            (v) => v.site === "YouTube" && !BLACKLISTED_VIDEOS.includes(v.key),
          )
          .map((v) => [v.key, v]),
      ).values(),
    );

    if (uniqueVideos.length === 0) return null;

    // SCORING SYSTEM — Official content + High Quality prioritized
    const scoredVideos = uniqueVideos.map((v) => {
      let score = 0;
      const name = v.name.toLowerCase();

      // 1. Official Status (SUPREME PRIORITY)
      if (v.official) score += 1000000;

      // 2. Unofficial Keyword Penalty (Concept/Fan trailers)
      const unofficialTerms = [
        "concept",
        "fan",
        "fanmade",
        "edited",
        "mashup",
        "ai trailer",
      ];
      for (const term of unofficialTerms) {
        if (name.includes(term)) {
          score -= 500000;
        }
      }

      // 3. Quality (Industrial Aggressive Optimization)
      // We prioritize exact 1080p matching for bitstream stability
      if (v.size === 1080) score += 50000;
      else if (v.size === 2160)
        score += 60000; // 4K is king
      else if (v.size === 720) score += 5000;
      else score -= 10000; // Penalize anything below HD

      // 4. Content Type
      if (v.type === "Trailer") score += 3000;
      else if (v.type === "Teaser") score += 2000;
      else if (v.type === "Opening" || v.type === "Ending")
        score -= 5000; // Penalize Openings for mobile compliance
      else if (v.type === "Clip") score += 500;

      // 5. Content-Specific Installment Matching (CRITICAL)
      const requestedTitle = (meta.originalTitle || "").toLowerCase();

      // A) Season/Part Matching for Episodic (TV/Anime)
      if (normalizedType === "tv" && season) {
        const sString = `season ${season}`;
        const sShort = `s${season}`;
        const sPart = `part ${season}`;
        const sCour = `cour ${season}`;

        if (
          name.includes(sString) ||
          name.includes(sShort) ||
          name.includes(sPart) ||
          name.includes(sCour)
        ) {
          score += 15000;
        }

        // Penalize other explicit versions
        for (let otherS = 1; otherS <= 10; otherS++) {
          if (otherS === Number(season)) continue;
          const isOther =
            name.includes(`season ${otherS}`) ||
            name.includes(`s${otherS}`) ||
            name.includes(`part ${otherS}`) ||
            name.includes(`cour ${otherS}`) ||
            new RegExp(`\\s${otherS}(\\s|$)`).test(name);
          if (isOther) score -= 15000;
        }
      }

      // B) Sequel Protection (Universal: Movies/TV/Anime)
      // If the video name contains a number (2-9) that IS NOT in the official title, it's likely a sequel.
      const installmentNumbers = [" 2", " 3", " 4", " 5", " ii", " iii"]; // Space prefixed to avoid years
      for (const num of installmentNumbers) {
        const cleanNum = num.trim().toLowerCase();
        const hasInVideo = name.includes(cleanNum);
        const hasInTitle = requestedTitle.includes(cleanNum);

        if (hasInVideo && hasInTitle) {
          score += 20000; // MASSIVE boost if we are specifically looking for a sequel
        } else if (hasInVideo && !hasInTitle) {
          // If video has "2" but title doesn't, it's a sequel. Penalize unless it's a year.
          const isYearMatch = meta.year && String(meta.year).includes(cleanNum);
          if (!isYearMatch) {
            score -= 25000;
          }
        }
      }

      // C) Franchise Discrimination & Subtitle Precision
      const franchiseKeywords = [
        "days",
        "weeks",
        "years",
        "months",
        "vol",
        "volume",
        "part",
      ];
      for (const kw of franchiseKeywords) {
        if (name.includes(kw) && !requestedTitle.includes(kw)) {
          score -= 15000;
        }
        if (name.includes(kw) && requestedTitle.includes(kw)) {
          score += 5000;
        }
      }

      // Subtitle Match: Be VERY careful - often fan-coined titles hijack this.
      // Only apply if the video is already marked as official.
      if (requestedTitle.includes(":") && v.official) {
        const subtitle = requestedTitle.split(":")[1].trim();
        if (subtitle.length > 3 && name.includes(subtitle.toLowerCase())) {
          score += 10000; // Conservative boost for verified officials only
        }
      }

      // 6. Contextual Keywords (Universal)
      if (name.includes("trailer")) score += 3000;
      if (name.includes("official")) score += 1000;

      if (normalizedType === "movie" && meta.year) {
        if (name.includes(String(meta.year))) score += 5000;
      }

      if (normalizedType === "anime") {
        if (name.includes("pv") || name.includes("teaser")) score += 1000;
      }

      // Penalize Opening/Ending keywords too
      if (
        name.includes("opening") ||
        name.includes("ending") ||
        name.includes("op") ||
        name.includes("ed")
      ) {
        score -= 8000;
      }

      return { ...v, score };
    });

    scoredVideos.sort((a, b) => b.score - a.score);
    const candidateKeys = scoredVideos.slice(0, 10).map((v) => v.key);

    logger.playback(
      `Found ${candidateKeys.length} candidates for ${contentId}`,
    );

    // ── Validate each key via YouTube Data API (check region blocks) ──
    const validKeys = await validateYouTubeBulk(candidateKeys);

    if (validKeys.length === 0) {
      logger.warn(`No TMDB keys passed validation for ${contentId}`);
      return null;
    }

    logger.playback(`Validated ${validKeys.length} keys for playback`);

    return {
      bestKey: validKeys[0],
      fallbacks: validKeys.slice(1),
      loopWindow: await getLoopWindow(validKeys[0]),
    };
  } catch (err) {
    logger.error("Trailer resolve failed:", err.message);
    return null;
  }
};

// ================================
// FETCH TMDB TITLE (for search fallback)
// ================================
export const fetchTmdbTitle = async (contentType, contentId) => {
  try {
    const tmdbId = normalizeTmdbId(contentId);
    const normalizedType = normalizeContentType(contentType);
    const url = `${TMDB_BASE}/${normalizedType}/${tmdbId}?api_key=${TMDB_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.title || data.name || null;
  } catch {
    return null;
  }
};

// ================================
// AUTOPLAY RESOLVER
// ================================
export const resolveNextPlayback = async ({
  uid,
  contentType,
  seriesId,
  season,
  episode,
}) => {
  const subSnap = await firestore.collection("subscriptions").doc(uid).get();

  if (!subSnap.exists || subSnap.data().status !== "active") {
    return {
      allowed: false,
      shouldAutoPlay: false,
      reason: "subscription_expired",
      blocked: true,
      cta: {
        type: "subscribe",
        message: "Subscribe to continue watching",
      },
    };
  }

  const normalizedType = normalizeContentType(contentType);

  if (normalizedType === "movie") {
    return {
      allowed: true,
      shouldAutoPlay: false,
      reason: "movie_completed",
    };
  }

  if (!seriesId || !season || !episode) {
    throw new Error("seriesId, season and episode are required for series");
  }

  const seasonData = await fetchSeasonFromTMDB(seriesId, season);

  const totalEpisodes = Array.isArray(seasonData.episodes)
    ? seasonData.episodes.length
    : 0;

  if (!totalEpisodes) {
    throw new Error("No episodes found for this season");
  }

  if (episode < totalEpisodes) {
    return {
      allowed: true,
      shouldAutoPlay: true,
      reason: "next_episode_available",
      next: {
        contentType: "series",
        seriesId,
        season,
        episode: episode + 1,
      },
      countdownSeconds: 10,
    };
  }

  try {
    await fetchSeasonFromTMDB(seriesId, season + 1);

    return {
      allowed: true,
      shouldAutoPlay: true,
      reason: "next_season_available",
      next: {
        contentType: "series",
        seriesId,
        season: season + 1,
        episode: 1,
      },
      countdownSeconds: 10,
    };
  } catch {
    return {
      allowed: true,
      shouldAutoPlay: false,
      reason: "series_completed",
      seriesCompleted: true,
      cta: {
        type: "recommendations",
        message: "You've finished this series",
      },
    };
  }
};

// ================================
// RESUME PLAYBACK
// ================================
export const resolveResumePlayback = async ({
  uid,
  contentId,
  season,
  episode,
  contentType,
}) => {
  const isEpisodic = ["tv", "series", "anime"].includes(contentType);
  const docId = isEpisodic
    ? `${contentId}_S${season}_E${episode}`
    : `${contentId}`;

  const snap = await firestore
    .collection("users")
    .doc(uid)
    .collection("watch_history")
    .doc(docId)
    .get();

  if (!snap.exists) {
    return {
      resume: false,
      positionSeconds: 0,
    };
  }

  const data = snap.data();

  return {
    resume: true,
    positionSeconds: data.progress || 0,
    durationSeconds: data.durationSeconds || 0,
    percentage: data.durationSeconds
      ? Math.round((data.progress / data.durationSeconds) * 100)
      : 0,
  };
};

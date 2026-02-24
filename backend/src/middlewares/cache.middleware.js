/**
 * Industrial Cache Middleware
 *
 * Sets Cache-Control headers for predictable API responses.
 *
 * @param {number} duration - Cache duration in seconds
 */
export const cacheResponse = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Set Cache-Control header
    // public: can be cached by browser and CDN
    // max-age: browser cache duration
    // s-maxage: CDN cache duration
    res.set(
      "Cache-Control",
      `public, max-age=${duration}, s-maxage=${duration}`,
    );

    next();
  };
};

export const cacheMiddleware = cacheResponse;

/**
 * No-Cache Middleware
 * Ensures sensitive data is never cached
 */
export const noCache = (req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
};

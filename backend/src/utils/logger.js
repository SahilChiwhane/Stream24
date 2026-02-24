/**
 * Industrial Logger Utility
 * Standardizes application logs and suppresses noise based on environment.
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  info: (msg, ...args) => {
    console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`, ...args);
  },

  warn: (msg, ...args) => {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${msg}`, ...args);
  },

  error: (msg, ...args) => {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`, ...args);
  },

  debug: (msg, ...args) => {
    if (isDev) {
      console.log(`\x1b[90m[DEBUG]\x1b[0m ${msg}`, ...args);
    }
  },

  // Specialized industrial logs
  playback: (msg, ...args) => {
    if (isDev) {
      console.log(`\x1b[35m[PLAYBACK]\x1b[0m ${msg}`, ...args);
    }
  },

  auth: (msg, ...args) => {
    console.log(`\x1b[32m[AUTH]\x1b[0m ${msg}`, ...args);
  },
};

export default logger;

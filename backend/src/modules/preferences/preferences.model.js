// backend/src/modules/preferences/preferences.model.js

export const preferencesCollection = "preferences";

export const buildDefaultPreferences = (uid) => ({
  uid,

  playback: {
    autoplayPreview: true, // autoplay teaser/trailer
    previewMuted: true, // premium default
  },

  subtitles: {
    enabled: false,
    language: "en",
  },

  ui: {
    reducedMotion: false,
  },

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

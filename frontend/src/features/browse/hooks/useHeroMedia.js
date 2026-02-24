// frontend/src/hooks/useHeroMedia.js
import { useEffect, useState } from "react";

const TMDB = "https://image.tmdb.org/t/p";

const build = (path, size) => path ? `${TMDB}/${size}${path}` : null;

export const useHeroMedia = (movie) => {
  const [media, setMedia] = useState(null);
  const [blur, setBlur] = useState(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!movie) return;

    const update = () => {
      const w = window.innerWidth;
      let main = null;
      let lqip = null;

      const poster = movie.poster;
      const backdrop = movie.backdrop;

      // MOBILE → poster priority
      if (w < 640) {
        if (poster) {
          main = build(poster, "w780");
          lqip = build(poster, "w154");
        } else if (backdrop) {
          main = build(backdrop, "w780");
          lqip = build(backdrop, "w154");
        }
      }

      // TABLET
      else if (w < 1024) {
        if (backdrop) {
          main = build(backdrop, "w1280");
          lqip = build(backdrop, "w300");
        } else if (poster) {
          main = build(poster, "w780");
          lqip = build(poster, "w154");
        }
      }

      // DESKTOP
      else {
        if (backdrop) {
          main = build(backdrop, "original");
          lqip = build(backdrop, "w300");
        } else if (poster) {
          main = build(poster, "w780");
          lqip = build(poster, "w154");
        }
      }

      setMedia(main);
      setBlur(lqip);
      setKey((k) => k + 1); // force crossfade
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [movie]);

  return { media, blur, key };
};

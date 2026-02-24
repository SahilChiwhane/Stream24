import { useCallback, useEffect, useRef, useState } from "react";

export const useCarouselScroll = () => {
  const rowRef = useRef(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;

    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      updateArrows();
    });

    // Observe both the container and its children changes
    observer.observe(el);

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;

    el.scrollBy({
      left: dir === "left" ? -el.clientWidth : el.clientWidth,
      behavior: "smooth",
    });
  };

  return {
    rowRef,
    canLeft,
    canRight,
    scroll,
  };
};

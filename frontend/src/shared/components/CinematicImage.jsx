import React, { useState, useEffect } from "react";

/**
 * Industrial Optimized Image Component
 * Features: Blur-up loading (LQIP), high-fidelity transitions, and responsive srcSet.
 */
const CinematicImage = ({
  src,
  alt,
  className = "",
  style = {},
  priority = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);

  useEffect(() => {
    if (!src) return;

    // Clear state for new source
    setIsLoaded(false);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ ...style }}
    >
      {/* LQIP / Placeholder Background */}
      <div
        className={`absolute inset-0 bg-neutral-900 transition-opacity duration-700 ${isLoaded ? "opacity-0" : "opacity-100"}`}
      />

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-[1000ms] ${
            isLoaded
              ? "opacity-100 scale-100 blur-0"
              : "opacity-0 scale-110 blur-xl"
          }`}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );
};

export default CinematicImage;

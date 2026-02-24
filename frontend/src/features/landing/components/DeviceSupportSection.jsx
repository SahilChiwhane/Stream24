import React, { useEffect, useRef, useState } from "react";
import Device from "../../../assets/Device.png";
import Noise from "../../../assets/noise.png";

const DeviceHeroSection = () => {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const start = windowHeight;
      const end = windowHeight * 0.3;
      const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const reveal = (delayIdx = 0, direction = "up") => {
    const elementProgress = Math.max(
      0,
      Math.min(1, progress * 1.2 - delayIdx * 0.1),
    );
    const translate = {
      up: `translateY(${20 * (1 - elementProgress)}px)`,
      down: `translateY(${-20 * (1 - elementProgress)}px)`,
      left: `translateX(${-32 * (1 - elementProgress)}px)`,
      right: `translateX(${32 * (1 - elementProgress)}px)`,
    };

    return {
      opacity: elementProgress,
      transform: `${translate[direction]} scale(${0.985 + 0.015 * elementProgress})`,
      transition:
        "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)",
    };
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white overflow-hidden"
    >
      {/* Blue hairline */}
      <div
        className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(59,130,246,0.5) 35%, rgba(59,130,246,0.5) 65%, transparent)",
        }}
      />

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: `url(${Noise})`, backgroundRepeat: "repeat" }}
      />

      {/* Top / bottom dissolve */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black to-transparent z-10" />

      {/* ── Layout: equal-weight two columns ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 items-center">
          {/* ── Image ── */}
          <div
            style={{
              opacity: Math.max(0, Math.min(1, progress * 1.15)),
              transform: `translateX(${(1 - Math.max(0, Math.min(1, progress * 1.15))) * -40}px) scale(${0.98 + 0.02 * Math.max(0, Math.min(1, progress * 1.15))})`,
              transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}
          >
            <div className="relative -ml-6 md:-ml-20">
              {/* Single clean blue glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 65% 60% at 45% 50%, rgba(59,130,246,0.18) 0%, transparent 65%)",
                }}
              />
              <img
                src={Device}
                alt="Stream24 multi-device experience"
                loading="lazy"
                className="relative w-full object-contain z-0"
                style={{ borderRadius: "0px" }}
              />
              {/* Sharp Square Edge Fades (No rounding) */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Horizontal fades */}
                <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black via-black/40 to-transparent" />
                <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black via-black/40 to-transparent" />

                {/* Vertical fades */}
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>
            </div>
          </div>

          {/* ── Text — same visual weight as the image ── */}
          <div className="flex items-center lg:justify-end">
            <div className="max-w-lg w-full">
              {/* Eyebrow */}
              <div
                className="flex items-center gap-2.5 mb-8"
                style={reveal(0, "right")}
              >
                <span className="w-5 h-[1.5px] bg-blue-500" />
                <span className="text-[11px] font-medium tracking-[0.24em] uppercase text-blue-400">
                  Multi-Device
                </span>
              </div>

              {/* Headline — sized to match the image's visual mass */}
              <h2
                className="mb-8"
                style={{ lineHeight: isMobile ? 1.2 : 1.04 }}
              >
                <span
                  className="block font-light"
                  style={{
                    fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                    letterSpacing: "-0.015em",
                    color: "rgba(235,240,255,0.52)",
                    ...reveal(1, "right"),
                  }}
                >
                  Your screen
                </span>

                <span
                  className="block font-bold"
                  style={{
                    fontSize: "clamp(3rem, 5.5vw, 5rem)",
                    letterSpacing: "-0.04em",
                    background:
                      "linear-gradient(150deg, #f0f7ff 0%, #93c5fd 60%, #818cf8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    ...reveal(2, "right"),
                  }}
                >
                  should never
                </span>

                <span
                  className="block font-light"
                  style={{
                    fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                    letterSpacing: "-0.015em",
                    color: "rgba(235,240,255,0.42)",
                    ...reveal(3, "right"),
                  }}
                >
                  be the limit.
                </span>
              </h2>

              {/* Subcopy */}
              <p
                className="leading-relaxed font-light mb-10"
                style={{
                  fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
                  color: "rgba(235,240,255,0.42)",
                  maxWidth: "38ch",
                  ...reveal(4, "right"),
                }}
              >
                Stream24 follows you — from pocket to living room. Wherever you
                continue, the experience feels{" "}
                <span style={{ color: "rgba(235,240,255,0.68)" }}>
                  uninterrupted and always familiar.
                </span>
              </p>

              {/* Accent line */}
              <div style={reveal(5, "right")}>
                <div
                  className="h-px w-20"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(99,102,241,0.75), rgba(59,130,246,0.35), transparent)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeviceHeroSection;

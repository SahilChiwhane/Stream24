import { useEffect, useRef, useState } from "react";
import StreamingExp from "../../../assets/streamExp.png";

const StreamingBenefitsSection = () => {
  const ref = useRef(null);
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
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress: starts at viewport bottom, finishes at viewport center
      const start = windowHeight;
      const end = windowHeight * 0.3;
      const current = rect.top;

      const p = Math.max(0, Math.min(1, (start - current) / (start - end)));
      setProgress(p);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const reveal = (delayIdx = 0, direction = "up") => {
    // Each element is slightly staggered based on its index
    const elementProgress = Math.max(
      0,
      Math.min(1, progress * 1.2 - delayIdx * 0.1),
    );

    const translate = {
      up: `translateY(${20 * (1 - elementProgress)}px)`,
      left: `translateX(${-32 * (1 - elementProgress)}px)`,
      right: `translateX(${32 * (1 - elementProgress)}px)`,
    };

    return {
      opacity: elementProgress,
      transform: `${translate[direction]} scale(${0.985 + 0.015 * elementProgress})`,
      transition:
        "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
    };
  };

  return (
    <section
      ref={ref}
      className="relative bg-black text-white overflow-hidden py-28 md:py-40"
    >
      <div className="relative z-10 max-w-7xl mx-auto lg:px-6">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20 items-center">
          {/* ───────────── TEXT CONTENT (RIGHT-ALIGNED ON MOBILE) ───────────── */}
          <div className="max-w-xl lg:pt-20 px-6 lg:px-0 flex flex-col items-end text-right lg:items-start lg:text-left">
            {/* Eyebrow */}
            <div
              className="flex items-center gap-3 mb-6"
              style={reveal(0, isMobile ? "right" : "left")}
            >
              {!isMobile && <span className="w-6 h-[1px] bg-blue-500" />}
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-400">
                Premium Fidelity
              </span>
              {isMobile && <span className="w-6 h-[1px] bg-blue-500" />}
            </div>

            {/* Headline */}
            <h2 className="mb-6" style={{ lineHeight: isMobile ? 1.2 : 1.04 }}>
              <span
                className="block font-light"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  letterSpacing: "-0.015em",
                  color: "rgba(235,240,255,0.52)",
                  ...reveal(1, isMobile ? "right" : "left"),
                }}
              >
                Nothing breaks
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
                  ...reveal(2, isMobile ? "right" : "left"),
                }}
              >
                the Moment.
              </span>
            </h2>

            {/* Copy */}
            <p
              className="leading-relaxed font-light mb-4"
              style={{
                fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
                color: "rgba(235,240,255,0.42)",
                maxWidth: "38ch",
                ...reveal(3, isMobile ? "right" : "left"),
              }}
            >
              Stream24 is engineered to disappear.
              <br />
              So nothing stands between you and the story.
            </p>

            <p
              className="mb-8"
              style={{
                fontSize: "0.95rem",
                color: "rgba(235,240,255,0.38)",
                maxWidth: "40ch",
                ...reveal(4, isMobile ? "right" : "left"),
              }}
            >
              No noise. No interruptions.
              <br />
              Just you — exactly where you left off.
            </p>

            {/* Accent line */}
            <div style={reveal(5, isMobile ? "right" : "left")}>
              <div
                className="h-px w-20"
                style={{
                  background: isMobile
                    ? "linear-gradient(to left, rgba(99,102,241,0.75), rgba(59,130,246,0.35), transparent)"
                    : "linear-gradient(to right, rgba(99,102,241,0.75), rgba(59,130,246,0.35), transparent)",
                }}
              />
            </div>
          </div>

          <div
            className="relative lg:-mr-48 w-full group overflow-hidden lg:overflow-visible"
            style={{
              opacity: Math.max(0, Math.min(1, progress * 1.1)),
              transform: `translateX(${(1 - Math.max(0, Math.min(1, progress * 1.1))) * 40}px) scale(${0.98 + 0.02 * Math.max(0, Math.min(1, progress * 1.1))})`,
              transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            }}
          >
            <div className="relative w-full aspect-video md:aspect-auto">
              <img
                src={StreamingExp}
                alt=""
                aria-hidden="true"
                className={`w-full h-auto max-h-[85vh] object-cover scale-y-110 lg:scale-y-125 origin-center ${
                  isMobile ? "-scale-x-110" : "lg:scale-x-125"
                }`}
                style={{
                  WebkitMaskImage: `
                    radial-gradient(
                      circle at ${isMobile ? "35%" : "65%"} 50%,
                      rgba(0,0,0,1) 0%,
                      rgba(0,0,0,1) 35%,
                      rgba(0,0,0,0.8) 55%,
                      rgba(0,0,0,0.4) 75%,
                      rgba(0,0,0,0) 100%
                    ),
                    linear-gradient(
                      to right,
                      transparent 0%,
                      black 15%,
                      black 85%,
                      transparent 100%
                    ),
                    linear-gradient(
                      to bottom,
                      rgba(0,0,0,1) 0%,
                      rgba(0,0,0,1) 80%,
                      rgba(0,0,0,0) 100%
                    )
                  `,
                  maskImage: `
                    radial-gradient(
                      circle at ${isMobile ? "35%" : "65%"} 50%,
                      rgba(0,0,0,1) 0%,
                      rgba(0,0,0,1) 35%,
                      rgba(0,0,0,0.8) 55%,
                      rgba(0,0,0,0.4) 75%,
                      rgba(0,0,0,0) 100%
                    ),
                    linear-gradient(
                      to right,
                      transparent 0%,
                      black 15%,
                      black 85%,
                      transparent 100%
                    ),
                    linear-gradient(
                      to bottom,
                      rgba(0,0,0,1) 0%,
                      rgba(0,0,0,1) 80%,
                      rgba(0,0,0,0) 100%
                    )
                  `,
                  WebkitMaskComposite: "destination-in",
                  maskComposite: "intersect",
                  filter: "brightness(1.05) contrast(1.05)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StreamingBenefitsSection;

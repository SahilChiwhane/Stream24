import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BGImg from "../../../assets/heroBg.png";
import "./HeroSection.css";

/* ─── Helpers ────────────────────────────────── */
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/* ─── Component ──────────────────────────────── */
const HeroSection = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scrollHint, setScrollHint] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const submitTimerRef = useRef(null);
  const scrollTimerRef = useRef(null);

  /* ── Mount animation trigger ── */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── Scroll indicator: fade in at 1s, auto-hide at 5.5s ── */
  useEffect(() => {
    if (!mounted) return;
    const showT = setTimeout(() => setScrollHint(true), 1000);
    const hideT = setTimeout(() => setScrollHint(false), 5500);
    scrollTimerRef.current = hideT;
    return () => {
      clearTimeout(showT);
      clearTimeout(hideT);
    };
  }, [mounted]);

  /* ── Scroll Tracking ── */
  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 60) setScrollHint(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Cleanup submit timer on unmount ── */
  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    };
  }, []);

  /* ── Form submission ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    const v = identifier.trim();
    if (!v) {
      setError("Please enter your email address.");
      return;
    }
    if (!isEmail(v)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setSubmitting(true);
    submitTimerRef.current = setTimeout(() => {
      setSubmitting(false);
      navigate("/signup", { state: { identifier: v } });
    }, 600);
  };

  /* ── Entrance animation helper ── */
  const fadeUp = (delayMs, direction = "left") => {
    const translate = {
      up: "translateY(24px)",
      left: "translateX(-32px)",
      none: "none",
    };

    return {
      opacity: mounted ? Math.max(0, 1 - scrollY / 600) : 0,
      transform: mounted
        ? `translate(0, ${scrollY * 0.15}px) scale(1)`
        : `${translate[direction]} scale(0.985)`,
      transition: `opacity 1.1s cubic-bezier(.16,1,.3,1) ${delayMs}ms,
                   transform 1.1s cubic-bezier(.16,1,.3,1) ${delayMs}ms`,
    };
  };

  /* ──────────────────────────────────────────── */
  return (
    <section
      className="relative bg-black overflow-hidden"
      style={{ height: "100svh", minHeight: "600px" }}
    >
      {/* ── Background image ── */}
      <img
        src={BGImg}
        alt=""
        aria-hidden="true"
        className="hero-img absolute inset-0 w-full h-full object-cover"
        style={{
          animation: "bgZoom 18s ease-out forwards",
          transform: `scale(${1 + scrollY * 0.0003}) translateY(${scrollY * 0.2}px)`,
          opacity: 1 - scrollY / 900,
        }}
      />

      {/* ── Overlay layers ── */}
      {/* Base darken */}
      <div
        className="absolute inset-0 bg-black/25"
        style={{ opacity: 1 + scrollY / 1000 }}
      />

      {/* Side gradient (desktop: darkens right | mobile: darkens left via CSS) */}
      <div
        className="hero-side-grad absolute inset-0"
        style={{
          background:
            "linear-gradient(to left, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)",
        }}
      />

      {/* Right-edge vignette — mobile only (display toggled via CSS) */}
      <div
        className="hero-right-vignette absolute inset-y-0 right-0"
        style={{
          display: "none",
          width: "30%",
          background:
            "linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 100%)",
        }}
      />

      {/* Bottom gradient — fades hero into the next section */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "70%",
          background:
            "linear-gradient(to top, #000 0%, rgba(0,0,0,0.85) 30%, transparent 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-end">
        <div
          className="hero-content-inner hero-content-mobile pb-32"
          style={{
            paddingLeft: "clamp(1.25rem, 4vw, 7rem)",
            maxWidth: "640px",
          }}
        >
          {/* Headline */}
          <h1
            className="font-bold"
            style={{
              fontSize: "clamp(2.2rem, 4.6vw, 3.8rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              ...fadeUp(0),
            }}
          >
            <span style={{ color: "#ffffff" }}>Nothing between</span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.7)" }}>you and</span>
            <br />
            <span style={{ color: "#3b82f6" }}>the story.</span>
          </h1>

          {/* Sub-copy */}
          <p
            style={{
              marginTop: "1.4rem",
              fontSize: "clamp(.9rem, 1.2vw, 1.05rem)",
              color: "rgba(255,255,255,.55)",
              maxWidth: "34ch",
              ...fadeUp(180),
            }}
          >
            Watch what you love, without interruptions.
            <br />
            <span style={{ color: "rgba(255,255,255,.38)" }}>
              No ads. No pressure. Cancel anytime.
            </span>
          </p>

          {/* CTA form */}
          <form
            onSubmit={handleSubmit}
            style={{ width: "100%", ...fadeUp(320) }}
          >
            <div className="cta-row mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                placeholder="Enter email address"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError("");
                }}
                className="w-full bg-transparent text-white placeholder-white/30 focus:outline-none"
                style={{
                  padding: "0.95rem 1.2rem",
                  borderRadius: "0.65rem",
                  border: "1px solid rgba(255,255,255,.22)",
                }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white font-bold transition whitespace-nowrap disabled:opacity-50 tracking-[0.04em]"
                style={{
                  padding: "0.85rem 1.6rem", // Tighter padding for mobile balance
                  borderRadius: "0.65rem",
                  fontSize: "0.9rem", // Slightly smaller font for a sleeker profile
                }}
              >
                {submitting ? "Please wait…" : "Stream Now"}
              </button>
            </div>

            {/* Validation error */}
            {error && (
              <p
                className="text-red-400 text-xs font-medium"
                style={{ marginTop: "0.5rem" }}
              >
                {error}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* ── Scroll indicator (always mounted — opacity drives fade in/out) ── */}
      {mounted && (
        <div
          className="hero-scroll absolute left-1/2 -translate-x-1/2 z-20
                     flex flex-col items-center gap-2 pointer-events-none"
          style={{
            bottom: "2rem",
            opacity: scrollHint ? 0.78 : 0,
            transition: "opacity 1s ease",
          }}
        >
          <div
            style={{
              width: 22,
              height: 36,
              border: "1.5px solid rgba(255,255,255,0.9)",
              borderRadius: 11,
              display: "flex",
              justifyContent: "center",
              paddingTop: 6,
            }}
          >
            <div
              style={{
                width: 2,
                height: 7,
                background: "rgba(255,255,255,0.95)",
                borderRadius: 2,
                animation: "mouseWheel 2s ease-in-out infinite",
              }}
            />
          </div>
          <span
            style={{
              fontSize: "7px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.8)",
              fontWeight: 500,
            }}
          >
            Scroll
          </span>
        </div>
      )}
    </section>
  );
};

export default HeroSection;

import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // 1. Disable browser's automatic scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // 2. Immediate reset (Force)
    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    reset();

    // 3. Secondary safeguard for complex layouts / async content
    const raf = requestAnimationFrame(reset);

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

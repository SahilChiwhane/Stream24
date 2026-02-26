// import { useEffect, useState } from "react";

// const MOBILE_BREAKPOINT = 640;

// export default function useSidebarLayout() {
//   const [isMobile, setIsMobile] = useState(() => {
//     if (typeof window === "undefined") return false;
//     return window.innerWidth <= MOBILE_BREAKPOINT;
//   });

//   const [collapsed, setCollapsed] = useState(true);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
//       setIsMobile(mobile);

//       if (mobile) {
//         setCollapsed(true);
//         document.documentElement.style.setProperty("--sidebar-current", "0px");
//       } else {
//         document.documentElement.style.setProperty(
//           "--sidebar-current",
//           collapsed
//             ? "var(--sidebar-collapsed)"
//             : "var(--sidebar-expanded)",
//         );
//       }
//     };

//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [collapsed]);

//   return {
//     isMobile,
//     collapsed,
//     setCollapsed,
//   };
// }

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 640;

export default function useSidebarLayout() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= MOBILE_BREAKPOINT;
  });

  const [collapsed, setCollapsed] = useState(true);

  // Handle resize only
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync CSS layout token — use rAF so it's applied before the next paint
  // This eliminates the 1-frame "stuck" delay on collapse/expand
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (isMobile) {
        document.documentElement.style.setProperty("--sidebar-current", "0px");
      } else {
        document.documentElement.style.setProperty(
          "--sidebar-current",
          collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-expanded)",
        );
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [collapsed, isMobile]);

  return {
    isMobile,
    collapsed,
    setCollapsed,
  };
}

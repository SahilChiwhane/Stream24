import React, { useState, useEffect, useRef } from "react";

const faqs = [
  {
    q: "What is Stream24?",
    a: "Stream24 is a cinematic sanctuary. A high-fidelity streaming platform meticulously engineered to deliver unlimited movies, TV shows, and anime across every screen you own, with zero compromises on quality.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Total freedom is part of the experience. You can manage and cancel your subscritpion at any moment directly from your account settings. No pressure, no awkward calls, no hidden friction.",
  },
  {
    q: "Which devices are supported?",
    a: "Wherever you are, the story follows. Stream24 is fully optimized for smartphones, tablets, laptops, and 4K Smart TVs, ensuring a seamless transition from one device to another.",
  },
  {
    q: "Do plans include HD or 4K streaming?",
    a: "We believe in visual truth. Depending on your choice of plan, you can unlock everything from crisp HD detail to ultra-vivid 4K HDR fidelity, accompanied by immersive spatial audio.",
  },
  {
    q: "Is Stream24 available worldwide?",
    a: "The world of entertainment is expanding. Stream24 is currently available in multiple regions, each offering a curated library of both global blockbusters and local originals.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef(null);

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
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const reveal = (delayIdx = 0, direction = "up") => {
    // Tightened ramp: starts later, finishes faster for more decisive 'pop'
    const elementProgress = Math.max(
      0,
      Math.min(1, progress * 1.5 - delayIdx * 0.1),
    );
    const translate = {
      up: `translateY(${16 * (1 - elementProgress)}px)`,
      none: "none",
    };

    return {
      opacity: elementProgress,
      transform: `${translate[direction]} scale(${0.99 + 0.01 * elementProgress})`,
      transition:
        "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
    };
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white py-16 md:py-24 overflow-hidden"
    >
      <div className="relative max-w-3xl mx-auto px-6">
        {/* Header Block — Compacted */}
        <div className="text-center mb-10 md:mb-14">
          <div
            className="flex items-center justify-center gap-3 mb-6"
            style={reveal(0)}
          >
            <span className="w-6 h-[1px] bg-blue-500" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-400">
              Support
            </span>
            <span className="w-6 h-[1px] bg-blue-500" />
          </div>

          <h2 className="mb-6" style={{ lineHeight: 1.2 }}>
            <span
              className="md:block font-light"
              style={{
                fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
                letterSpacing: "-0.015em",
                color: "rgba(235,240,255,0.52)",
                ...reveal(1),
              }}
            >
              Curious for{" "}
            </span>
            <span
              className="md:block font-bold text-white whitespace-nowrap"
              style={{
                fontSize: "clamp(1.8rem, 4.5vw, 4rem)",
                letterSpacing: "-0.04em",
                ...reveal(2),
              }}
            >
              More Information.
            </span>
          </h2>
        </div>

        {/* FAQ List — Minimalist technical aesthetic */}
        <div className="space-y-4 transition-transform duration-700 ease-out">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            const delayIdx = 3 + index;

            return (
              <div
                key={index}
                className={`group border-b border-white/[0.08] transition-all duration-500
                  ${isOpen ? "bg-white/[0.02]" : "hover:bg-white/[0.01]"}
                `}
                style={reveal(delayIdx)}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center py-4 md:py-5 px-4 text-left outline-none group"
                >
                  <span
                    className={`text-base md:text-lg font-medium tracking-tight transition-colors duration-300
                    ${isOpen ? "text-blue-400" : "text-white/60 group-hover:text-white"}
                  `}
                  >
                    {item.q}
                  </span>

                  {/* Custom Minimalist Toggle Icon */}
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <div
                      className={`absolute w-full h-[1.5px] bg-blue-500 transition-transform duration-500`}
                    />
                    <div
                      className={`absolute h-full w-[1.5px] bg-blue-500 transition-transform duration-500
                      ${isOpen ? "rotate-90 scale-0" : "rotate-0 scale-100"}
                    `}
                    />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isOpen ? "max-h-[300px] opacity-100 pb-5 px-4" : "max-h-0 opacity-0 px-4"}
                  `}
                >
                  <p className="text-white/40 leading-relaxed font-light text-[14px] md:text-[15px] max-w-2xl">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA — Subtly positioned */}
        <div className="mt-20 text-center" style={reveal(8)}>
          <p className="text-white/20 text-xs font-medium tracking-[0.15em]">
            Still Curious?{" "}
            <span className="text-blue-500/80 cursor-pointer hover:text-blue-400 transition-colors">
              Talk to us.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

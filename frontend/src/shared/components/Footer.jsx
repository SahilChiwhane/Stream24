import React, { memo } from "react";
import { FiGithub, FiLinkedin, FiExternalLink } from "react-icons/fi";
import { Link } from "react-router-dom";

const COMPANY_LINKS = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Terms", to: "/about" },
  { label: "Privacy", to: "/about" },
];

const SUPPORT_LINKS = [
  { label: "Help Center", to: "/about" },
  { label: "API Usage", to: "/about" },
  { label: "GitHub Store", to: "https://github.com/SahilChiwhane/" },
];

const SOCIAL_LINKS = [
  {
    icon: <FiGithub size={20} />,
    label: "GitHub",
    href: "https://github.com/SahilChiwhane/",
  },
  {
    icon: <FiLinkedin size={20} />,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sahil-chiwhane",
  },
];

const CURRENT_YEAR = new Date().getFullYear();

const FooterSection = ({ title, items }) => (
  <div className="flex flex-col gap-5">
    <h4 className="text-white text-[13px] font-black uppercase tracking-[0.25em] opacity-90">
      {title}
    </h4>
    <ul className="flex flex-col gap-3.5">
      {items.map((item) => (
        <li key={item.label}>
          {item.to.startsWith("http") ? (
            <a
              href={item.to}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white text-[15px] font-medium transition-all duration-300 hover:translate-x-1 inline-block flex items-center gap-1"
            >
              {item.label} <FiExternalLink size={12} className="opacity-50" />
            </a>
          ) : (
            <Link
              to={item.to}
              className="text-gray-500 hover:text-white text-[15px] font-medium transition-all duration-300 hover:translate-x-1 inline-block"
            >
              {item.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="relative bg-[#080808] text-white pt-24 pb-12 overflow-hidden border-t border-white/[0.03] font-sans">
      {/* Dynamic top glow edge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#2563EB]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 relative z-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 mb-20">
          {/* Brand Identity */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl select-none bg-[#2563EB] text-white">
                <span className="font-semibold text-sm tracking-tight text-white uppercase">
                  S24
                </span>
              </div>
              <span className="text-white/90 font-bold text-xl tracking-tight uppercase">
                STREAM<span className="text-[#2563EB]">24</span>
              </span>
            </div>
            <p className="text-gray-500 text-[14px] leading-relaxed max-w-[280px] font-medium italic">
              Stream24 © {CURRENT_YEAR} — Portfolio Project. Built for
              industry-level demonstration.
            </p>
            <div className="flex flex-col gap-1">
              <span className="text-white/80 font-black text-[12px] uppercase tracking-widest">
                Developed By
              </span>
              <span className="text-blue-500 font-bold text-sm tracking-tight">
                Sahil Chiwhane
              </span>
            </div>
          </div>

          <FooterSection title="Platform" items={COMPANY_LINKS} />
          <FooterSection title="Support" items={SUPPORT_LINKS} />

          {/* Social Presence */}
          <div className="flex flex-col gap-6">
            <h4 className="text-white text-[13px] font-black uppercase tracking-[0.25em] opacity-90">
              Community
            </h4>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600/10 hover:border-blue-600/20 transition-all duration-300 active:scale-90 shadow-lg shadow-black/20"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <p className="text-[12px] text-gray-600 font-bold uppercase tracking-[0.2em]">
              © {CURRENT_YEAR} — Built by Sahil Chiwhane
            </p>
            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.1em]">
              Portfolio Project • TMDB & YouTube Powered
            </p>
          </div>

          <div className="flex gap-4 sm:gap-8 flex-wrap justify-center">
            <Link
              to="/about"
              className="text-[11px] text-gray-600 font-black uppercase tracking-[0.2em] hover:text-blue-500 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-[11px] text-gray-600 font-black uppercase tracking-[0.2em] hover:text-blue-500 transition-colors"
            >
              Contact
            </Link>
            <a
              href="https://github.com/SahilChiwhane/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-600 font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-1"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/sahil-chiwhane"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-gray-600 font-black uppercase tracking-[0.2em] hover:text-[#0077b5] transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);

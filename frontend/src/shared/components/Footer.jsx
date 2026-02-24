import React, { memo } from "react";
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const COMPANY_LINKS = ["About", "Careers", "Press", "Terms", "Privacy"];

const SUPPORT_LINKS = ["Help Center", "Contact Us", "Accessibility", "Refunds"];

const SOCIAL_LINKS = [
  { icon: <FaInstagram />, label: "Instagram", href: "/" },
  { icon: <FaTwitter />, label: "Twitter", href: "/" },
  { icon: <FaFacebookF />, label: "Facebook", href: "/" },
  { icon: <FaLinkedinIn />, label: "LinkedIn", href: "/" },
  { icon: <FaYoutube />, label: "YouTube", href: "/" },
];

const CURRENT_YEAR = new Date().getFullYear();

const FooterSection = ({ title, items }) => (
  <div className="flex flex-col gap-5">
    <h4 className="text-white text-[13px] font-black uppercase tracking-[0.25em] opacity-90">
      {title}
    </h4>
    <ul className="flex flex-col gap-3.5">
      {items.map((label) => (
        <li key={label}>
          <a
            href="/"
            className="text-gray-500 hover:text-white text-[15px] font-medium transition-all duration-300 hover:translate-x-1 inline-block"
          >
            {label}
          </a>
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
                <span className="font-semibold text-sm tracking-tight">
                  S24
                </span>
              </div>
              <span className="text-white/90 font-bold text-xl tracking-tight uppercase">
                STREAM<span className="text-[#2563EB]">24</span>
              </span>
            </div>
            <p className="text-gray-500 text-[15px] leading-relaxed max-w-[240px] font-medium">
              The ultimate streaming destination for premium entertainment and
              interactive experiences.
            </p>
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
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600/10 hover:border-blue-600/20 transition-all duration-300 active:scale-90"
                >
                  {React.cloneElement(icon, { size: 18 })}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[12px] text-gray-600 font-bold uppercase tracking-[0.2em]">
            © {CURRENT_YEAR} STREAM24 GLOBAL MEDIA.
          </p>

          <div className="flex gap-8">
            <a
              href="/"
              className="text-[12px] text-gray-600 font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              Safety
            </a>
            <a
              href="/"
              className="text-[12px] text-gray-600 font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              Cookies
            </a>
            <a
              href="/"
              className="text-[12px] text-gray-600 font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
              Press
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);

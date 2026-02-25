import React, { useEffect } from "react";
import { FiGithub, FiLinkedin, FiCode, FiLayers, FiInfo } from "react-icons/fi";

const AboutContact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const socialLinks = [
    {
      icon: <FiGithub />,
      label: "GitHub",
      href: "https://github.com/SahilChiwhane/",
      color: "hover:bg-[#24292e]",
    },
    {
      icon: <FiLinkedin />,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/sahil-chiwhane",
      color: "hover:bg-[#0077b5]",
    },
  ];

  const techStack = [
    { name: "React", category: "Frontend", level: "Senior" },
    { name: "Node.js", category: "Backend", level: "Industrial" },
    { name: "Firebase", category: "Auth/DB", level: "Cloud" },
    { name: "Tailwind CSS", category: "Styling", level: "Premium" },
    { name: "Express", category: "API", level: "Robust" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-600/30">
      {/* Hero Section */}
      <section className="relative px-8 pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <FiCode /> Developer Identity
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            ABOUT <span className="text-blue-600 font-outline-2">STREAM24</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 font-medium leading-relaxed mb-12">
            Stream24 is a full-stack OTT-style platform built as a portfolio
            project to demonstrate advanced frontend engineering, backend
            architecture, and seamless system design.
          </p>

          <div className="flex flex-wrap gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:scale-105 hover:border-blue-500/30 font-bold text-sm tracking-wide ${link.color}`}
              >
                {link.icon} {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      </section>

      {/* Project Explanation */}
      <section className="px-8 pb-32">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Card 1: Purpose */}
          <div className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all duration-500">
            <FiLayers className="text-3xl text-blue-600 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-widest mb-4">
              Core Mission
            </h3>
            <p className="text-gray-400 leading-relaxed font-normal">
              This project serves as a comprehensive technical playground. It
              explores real-world challenges in video delivery, state
              management, and cross-platform responsiveness. No copyrighted
              content is hosted; every design decision is optimized for scalable
              demonstration.
            </p>
          </div>

          {/* Card 2: API Usage */}
          <div className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all duration-500">
            <FiInfo className="text-3xl text-blue-600 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-widest mb-4">
              API Attribution
            </h3>
            <p className="text-gray-400 leading-relaxed font-normal">
              Metadata and cinematic imagery are sourced via{" "}
              <strong>The Movie Database (TMDB)</strong>. Playback previews and
              trailers are resolved dynamically through the{" "}
              <strong>YouTube API</strong>. This demonstrates robust third-party
              integration and data mapping.
            </p>
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div className="max-w-4xl mx-auto mt-20">
          <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-500 mb-10 text-center">
            Industrial Tech Stack
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="flex flex-col items-center p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-blue-600/5 hover:border-blue-600/20 transition-all cursor-default"
              >
                <span className="text-white font-black uppercase tracking-widest text-[14px] mb-1">
                  {tech.name}
                </span>
                <span className="text-blue-500 font-bold text-[10px] uppercase tracking-tighter opacity-70">
                  {tech.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer-like Contact */}
      <section className="bg-white/[0.02] border-t border-white/5 py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-6">
            Let's Connect
          </h2>
          <p className="text-gray-400 mb-12 max-w-lg mx-auto font-medium">
            Currently open to engineering roles and technical collaborations.
            Reach out through any of the platforms below.
          </p>

          <div className="flex justify-center gap-12">
            <a
              href="https://linkedin.com/in/sahil-chiwhane"
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              <FiLinkedin size={32} />
            </a>
            <a
              href="https://github.com/SahilChiwhane/"
              className="text-gray-500 hover:text-white transition-colors"
            >
              <FiGithub size={32} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutContact;

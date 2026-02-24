import React from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

/**
 * Industrial Empty State Component
 * Standardized for Search, Wishlist, and History.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
        {Icon && <Icon className="text-gray-400" size={32} />}
      </div>

      <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
        {title}
      </h3>

      <p className="text-gray-500 max-w-sm mb-8 text-sm md:text-base leading-relaxed font-medium">
        {description}
      </p>

      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-xl transition-all duration-300 uppercase tracking-[0.15em] text-[10px] active:scale-95"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;

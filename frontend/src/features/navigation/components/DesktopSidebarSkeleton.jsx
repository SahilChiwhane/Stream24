import React from "react";

const SkeletonLine = ({ w = "100%" }) => (
  <div
    className="skeleton h-4 rounded-md"
    style={{ width: w }}
  />
);

const SkeletonCircle = ({ size = 36 }) => (
  <div
    className="skeleton rounded-full"
    style={{ width: size, height: size }}
  />
);

const NavItemSkeleton = ({ collapsed }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 ${
      collapsed ? "justify-center" : ""
    }`}
  >
    <SkeletonCircle size={28} />
    {!collapsed && <SkeletonLine w="60%" />}
  </div>
);

const DesktopSidebarSkeleton = ({ collapsed = true }) => {
  return (
    <aside
      data-testid="desktop-sidebar-skeleton"
      className="sidebar--BG fixed top-0 left-0 h-screen flex flex-col transition-[width] duration-300 ease-out"
      style={{ width: "var(--sidebar-current)" }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <SkeletonCircle size={40} />
          {!collapsed && <SkeletonLine w="120px" />}
        </div>

        {!collapsed && <SkeletonCircle size={28} />}
      </div>

      {/* NAV */}
      <div className="flex-1 flex flex-col gap-1 mt-3 px-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <NavItemSkeleton key={i} collapsed={collapsed} />
        ))}
      </div>

      {/* ACCOUNT */}
      <div className="mt-auto px-2 pb-3 space-y-2">
        <div
          className={`flex items-center gap-3 px-3 py-2 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <SkeletonCircle size={32} />
          {!collapsed && <SkeletonLine w="70%" />}
        </div>

        {!collapsed && (
          <div className="px-3">
            <SkeletonLine w="50%" />
          </div>
        )}
      </div>
    </aside>
  );
};

export default React.memo(DesktopSidebarSkeleton);

import { Outlet } from "react-router-dom";
import Sidebar from "../features/navigation/components/Sidebar";
import Footer from "../shared/components/Footer";

export default function AppLayout() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Sidebar />

      <div className="min-h-screen content-shell pl-0 sm:pl-[calc(var(--sidebar-current)+8px)] transition-[padding] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <Outlet />
        <div className="mt-2">
          <Footer />
        </div>
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import HomeNav from "../features/landing/components/HomeNav";
import Footer from "../shared/components/Footer";

export default function PublicLayout() {
  return (
    <div className="bg-black text-white min-h-screen">
      <HomeNav />
      <Outlet />
      <Footer />
    </div>
  );
}

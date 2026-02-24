import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../shared/components/Footer";

export default function SimpleLayout() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

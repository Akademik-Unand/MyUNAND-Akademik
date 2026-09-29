import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useUIStore } from "../store/ui.store";
export const MainLayout = () => {
  const { theme } = useUIStore();

  useEffect(() => {
    // Ensure document element has current theme on mount
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-base-200 text-base-content antialiased">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />

        <main className="mx-auto w-full max-w-none flex-1 p-4 md:p-6 lg:p-8 2xl:max-w-[1800px]">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

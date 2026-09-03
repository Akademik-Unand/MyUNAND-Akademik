import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Landmark,
  Building2,
  GraduationCap,
  TrendingUp,
  Calendar,
  Layers,
  FileCheck2,
  Award,
  BookOpenCheck,
  DoorOpen,
  UploadCloud,
  BarChart3,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { NAVIGATION_MENU } from '../constants/navigation';
import { useUIStore } from '../store/ui.store';

// Map icon string to Lucide component
const ICON_MAP = {
  LayoutDashboard,
  Landmark,
  Building2,
  GraduationCap,
  TrendingUp,
  Calendar,
  Layers,
  FileCheck2,
  Award,
  BookOpenCheck,
  DoorOpen,
  UploadCloud,
  BarChart3,
  FileSpreadsheet,
};

export const Sidebar = () => {
  const { isSidebarOpen, isMobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const location = useLocation();

  // State to track open submenus (e.g. "Semester")
  const [openSubmenus, setOpenSubmenus] = useState({ Semester: true });

  const toggleSubmenu = (title) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || Layers;
    return <IconComponent size={18} className="shrink-0" />;
  };

  const renderMenu = (expanded) => (
    <div className="flex flex-col h-full bg-base-100 border-r border-base-300 select-none">
      {/* Sidebar Header / Brand */}
      <div className="relative h-16 flex items-center justify-center bg-base-100 px-3 border-b border-base-300">
        <NavLink
          to="/"
          className="flex h-full items-center justify-center"
          onClick={() => setMobileSidebarOpen(false)}
          title="myUNAND"
        >
          <img
            src="/images/myunand.png"
            alt="myUNAND"
            className={
              expanded
                ? 'h-10 w-auto max-w-full object-contain'
                : 'h-10 w-10 object-cover object-left'
            }
          />
        </NavLink>

        {/* Close button on mobile drawer */}
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="btn btn-ghost btn-square btn-xs absolute right-2 text-base-content lg:hidden"
          aria-label="Tutup Menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-4">
        {NAVIGATION_MENU.map((item, idx) => {
          if (item.type === 'link') {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-content shadow-xs'
                    : 'text-base-content/80 hover:bg-base-200 hover:text-base-content'
                }`}
                title={item.label}
              >
                {renderIcon(item.icon)}
                {expanded && <span>{item.label}</span>}
              </NavLink>
            );
          }

          if (item.type === 'group') {
            return (
              <div key={idx} className="space-y-1">
                {expanded && (
                  <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-base-content/40">
                    {item.title}
                  </p>
                )}

                <div className="space-y-0.5">
                  {item.items.map((subItem, sIdx) => {
                    // Has nested children (like Semester -> Jenis, Setting)
                    if (subItem.children) {
                      const isOpen = openSubmenus[subItem.label] ?? false;
                      const hasActiveChild = subItem.children.some(
                        (c) => location.pathname === c.path
                      );

                      return (
                        <div key={sIdx} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => toggleSubmenu(subItem.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                  hasActiveChild
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-base-content/80 hover:bg-base-200 hover:text-base-content'
                }`}
                            title={subItem.label}
                          >
                            <div className="flex items-center gap-3">
                              {renderIcon(subItem.icon)}
                              {expanded && <span>{subItem.label}</span>}
                            </div>
                            {expanded && (
                              <span>
                                {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                              </span>
                            )}
                          </button>

                          {/* Children links */}
                          {isOpen && expanded && (
                            <div className="ml-5 pl-3 border-l-2 border-base-300 space-y-0.5 mt-1">
                              {subItem.children.map((child, cIdx) => {
                                const isChildActive = location.pathname === child.path;
                                return (
                                  <NavLink
                                    key={cIdx}
                                    to={child.path}
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                      isChildActive
                                        ? 'bg-primary text-primary-content font-bold'
                                        : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                                    }`}
                                  >
                                    {child.label}
                                  </NavLink>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isActive = location.pathname === subItem.path;
                    return (
                      <NavLink
                        key={sIdx}
                        to={subItem.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-content shadow-xs'
                            : 'text-base-content/80 hover:bg-base-200 hover:text-base-content'
                        }`}
                        title={subItem.label}
                      >
                        {renderIcon(subItem.icon)}
                        {expanded && <span>{subItem.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })}
      </nav>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="sticky top-0 h-screen overflow-hidden">{renderMenu(isSidebarOpen)}</div>
      </aside>

      {/* Mobile Offcanvas Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] shadow-2xl z-10">
            {renderMenu(true)}
          </div>
        </div>
      )}
    </>
  );
};

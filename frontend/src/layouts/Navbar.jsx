import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  Search,
  Building2,
} from "lucide-react";
import { useUIStore } from "../store/ui.store";
import { useAuthStore } from "../store/auth.store";
import { logoutSession } from "../services/api";
import { NavSearchModal } from "./NavSearchModal";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { getInitials } from "../utils/initials";
import { roleLabel } from "../constants/roles";
import { OrganizationSelector } from "../components/organization/OrganizationSelector";
import { accountUnitInfo } from "../helpers/accountUnit";

export const Navbar = () => {
  const { toggleSidebar, toggleMobileSidebar } = useUIStore();
  const { user, logout, refreshToken } = useAuthStore();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const unitInfo = accountUnitInfo(user);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "/" && !searchOpen) {
        const tag = document.activeElement?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-base-300 bg-base-100/90 px-4 md:px-6 backdrop-blur-md transition-colors">
      {/* Left side: Toggle button + Brand Title */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile menu trigger */}
        <button
          onClick={toggleMobileSidebar}
          className="btn btn-ghost btn-square btn-sm lg:hidden text-base-content"
          aria-label="Buka Menu"
        >
          <Menu size={20} />
        </button>

        {/* Desktop sidebar collapse trigger */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:inline-flex btn btn-ghost btn-square btn-sm text-base-content hover:bg-base-200"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Search trigger */}
        <div className="hidden sm:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 rounded-lg border border-base-300 bg-base-100 px-3.5 py-2 text-sm text-base-content/50 hover:bg-base-200 hover:text-base-content/70 transition-colors w-56"
          >
            <Search size={16} className="shrink-0" />
            <span className="flex-1 text-left">Cari...</span>
            <kbd className="hidden md:inline-block rounded border border-base-300 bg-base-100 px-1.5 text-[10px] text-base-content/40">
              /
            </kbd>
          </button>
        </div>
      </div>

      {/* Right side: Organization, Kemudahan, User Profile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <OrganizationSelector />

        {/* Mobile search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden btn btn-ghost btn-square btn-sm text-base-content"
          aria-label="Cari"
        >
          <Search size={18} />
        </button>

        <AccessibilityMenu />

        {/* User Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 pl-1 pr-2">
            <div className="avatar avatar-placeholder">
              <div className="w-8 rounded-full bg-primary text-primary-content text-xs">
                <span>{getInitials(user?.name)}</span>
              </div>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-medium text-base-content leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] text-base-content/60 leading-tight">
                {(user?.roles || [])
                  .map((role) => roleLabel(role.name))
                  .join(", ") || roleLabel(user?.role)}
              </span>
            </div>
            <ChevronDown
              size={14}
              className="opacity-60 hidden md:inline-block"
            />
          </label>

          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-60 border border-base-300 z-50 mt-2"
          >
            <li className="px-3 py-2 border-b border-base-200 mb-1">
              <div className="flex flex-col p-0">
                <p className="font-medium text-sm text-base-content truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-base-content/60 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-primary font-medium">
                  <ShieldCheck size={13} />
                  <span>
                    {(user?.roles || [])
                      .map((role) => roleLabel(role.name))
                      .join(", ") || roleLabel(user?.role)}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 mt-1 text-[11px] font-medium ${unitInfo.tone === "warning" ? "text-warning" : "text-base-content/70"}`}
                >
                  <Building2 size={13} />
                  <span className="truncate">
                    {unitInfo.label}: {unitInfo.value}
                  </span>
                </div>
              </div>
            </li>
            <li>
              <Link to="/profil" className="text-xs py-2">
                <User size={15} /> Profil Saya
              </Link>
            </li>
            <div className="divider my-1"></div>
            <li>
              <button
                type="button"
                className="text-xs py-2 text-error font-medium hover:bg-error/10"
                onClick={async () => {
                  try {
                    if (refreshToken) await logoutSession(refreshToken);
                  } catch {
                    /* tetap keluar di klien */
                  }
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                <LogOut size={15} /> Keluar
              </button>
            </li>
          </ul>
        </div>
      </div>

      <NavSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

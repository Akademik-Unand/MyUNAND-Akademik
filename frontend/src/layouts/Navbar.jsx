import { useEffect, useState } from 'react';
import { Menu, Bell, Palette, ChevronDown, User, LogOut, Check, ShieldCheck, Search } from 'lucide-react';
import { useUIStore } from '../store/ui.store';
import { useAuthStore } from '../store/auth.store';
import { AVAILABLE_THEMES } from '../constants/theme';
import { NavSearchModal } from './NavSearchModal';

export const Navbar = () => {
  const { toggleSidebar, toggleMobileSidebar, theme, setTheme } = useUIStore();
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '/' && !searchOpen) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          setSearchOpen(true);
        }
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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

      {/* Right side: Theme Switcher, Notifications, User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mobile search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="sm:hidden btn btn-ghost btn-square btn-sm text-base-content"
          aria-label="Cari"
        >
          <Search size={18} />
        </button>

        {/* Theme Picker Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm gap-1.5 font-medium text-xs px-2.5">
            <Palette size={16} className="text-primary" />
            <span className="hidden sm:inline-block capitalize">Tema: {theme}</span>
            <ChevronDown size={14} className="opacity-60" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-56 border border-base-300 z-50 mt-2 space-y-1"
          >
            <li className="menu-title text-[11px] font-medium uppercase tracking-wider text-base-content/60 px-3 py-1">
              Pilihan Token Tema
            </li>
            {AVAILABLE_THEMES.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center justify-between text-xs py-2 px-3 rounded-lg ${
                    theme === t.id ? 'active bg-primary text-primary-content' : 'hover:bg-base-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: t.primaryColor }}
                    ></span>
                    <span>{t.name}</span>
                  </div>
                  {theme === t.id && <Check size={14} />}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Notifications Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm relative text-base-content">
            <Bell size={18} />
            <span className="badge badge-xs badge-error absolute top-1 right-1"></span>
          </label>
          <div
            tabIndex={0}
            className="dropdown-content card card-compact w-72 p-0 shadow-xl bg-base-100 border border-base-300 z-50 mt-2"
          >
            <div className="card-body p-4">
              <h3 className="font-medium text-sm border-b border-base-200 pb-2">Notifikasi Akademik</h3>
              <div className="space-y-2 py-1 text-xs">
                <div className="p-2 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="font-medium text-warning-content">Batas Akhir Nilai</p>
                  <p className="text-base-content/70 text-[11px] mt-0.5">
                    Penginputan nilai semester genap tersisa 8 jam lagi.
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-info/10 border border-info/20">
                  <p className="font-medium text-info-content">Pemutakhiran Kurikulum</p>
                  <p className="text-base-content/70 text-[11px] mt-0.5">
                    CPMK prodi Sistem Informasi telah disetujui.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider divider-horizontal mx-0.5 h-6"></div>

        {/* User Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 pl-1 pr-2 rounded-xl">
            <div className="avatar">
              <div className="w-8 h-8 rounded-full ring-2 ring-primary/30">
                <img src={user?.avatar} alt={user?.name} />
              </div>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-medium text-base-content leading-tight">{user?.name}</span>
              <span className="text-[10px] text-base-content/60 leading-tight">{user?.role}</span>
            </div>
            <ChevronDown size={14} className="opacity-60 hidden md:inline-block" />
          </label>

          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-60 border border-base-300 z-50 mt-2"
          >
            <li className="px-3 py-2 border-b border-base-200 mb-1">
              <div className="flex flex-col p-0">
                <p className="font-medium text-sm text-base-content">{user?.name}</p>
                <p className="text-xs text-base-content/60">{user?.email}</p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-primary font-medium">
                  <ShieldCheck size={13} />
                  <span>{user?.faculty}</span>
                </div>
              </div>
            </li>
            <li>
              <a className="text-xs py-2">
                <User size={15} /> Profil Saya
              </a>
            </li>
            <div className="divider my-1"></div>
            <li>
              <a className="text-xs py-2 text-error font-medium hover:bg-error/10">
                <LogOut size={15} /> Keluar
              </a>
            </li>
          </ul>
        </div>
      </div>

      <NavSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};

import { Accessibility, Minus, Plus, Moon, Sun } from 'lucide-react';
import { useUIStore } from '../store/ui.store';
import { FONT_SCALES, getFontScale, isDarkTheme } from '../constants/theme';

/**
 * Menu kemudahan: ganti terang/gelap dan perbesar huruf.
 * Ukuran huruf disimpan di html supaya seluruh teks berbasis rem ikut membesar.
 */
export const AccessibilityMenu = () => {
  const { theme, toggleTheme, fontScale, setFontScale, stepFontScale } = useUIStore();
  const dark = isDarkTheme(theme);
  const current = getFontScale(fontScale);
  const index = FONT_SCALES.findIndex((item) => item.id === current.id);
  const atMin = index <= 0;
  const atMax = index >= FONT_SCALES.length - 1;

  return (
    <div className="dropdown dropdown-end">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-ghost btn-sm gap-1.5 px-2.5"
        aria-label="Kemudahan tampilan"
        title="Kemudahan tampilan"
      >
        <Accessibility size={16} className="text-primary" />
        <span className="hidden sm:inline text-xs font-medium">Kemudahan</span>
      </button>

      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-2 w-72 rounded-box border border-base-300 bg-base-100 p-3 shadow-xl"
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-base-content/60">
          Kemudahan tampilan
        </p>

        <p className="mb-1.5 text-sm font-medium">Mode tampilan</p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`btn btn-sm gap-1.5 ${dark ? 'btn-ghost' : 'btn-primary'}`}
            onClick={() => dark && toggleTheme()}
          >
            <Sun size={14} />
            Terang
          </button>
          <button
            type="button"
            className={`btn btn-sm gap-1.5 ${dark ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => !dark && toggleTheme()}
          >
            <Moon size={14} />
            Gelap
          </button>
        </div>

        <p className="mb-1.5 text-sm font-medium">Ukuran huruf</p>
        <p className="mb-2 text-xs text-base-content/60">
          Perbesar teks jika tulisan terasa kecil.
        </p>
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => stepFontScale(-1)}
            disabled={atMin}
            aria-label="Kecilkan huruf"
          >
            <Minus size={14} />
          </button>
          <span className="flex-1 text-center text-sm font-medium">{current.label}</span>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => stepFontScale(1)}
            disabled={atMax}
            aria-label="Perbesar huruf"
          >
            <Plus size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {FONT_SCALES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`btn btn-xs ${item.id === current.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFontScale(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

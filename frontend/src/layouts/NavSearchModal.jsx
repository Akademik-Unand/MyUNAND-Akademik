import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { NAVIGATION_MENU } from '../constants/navigation';

const buildIndex = () => {
  const items = [];
  const walk = (menu) => {
    menu.forEach((item) => {
      if (item.type === 'link') {
        items.push({ label: item.label, path: item.path, group: null });
      } else if (item.type === 'group') {
        item.items.forEach((sub) => {
          if (sub.children) {
            sub.children.forEach((child) => {
              items.push({ label: child.label, path: child.path, group: sub.label });
            });
          } else {
            items.push({ label: sub.label, path: sub.path, group: item.title });
          }
        });
      }
    });
  };
  walk(NAVIGATION_MENU);
  return items;
};

export const NavSearchModal = ({ open, onClose }) => {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      requestAnimationFrame(() => {
        setQuery('');
        inputRef.current?.focus();
      });
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const index = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index;
    return index.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || (item.group && item.group.toLowerCase().includes(q))
    );
  }, [query, index]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="modal-box max-w-lg p-0 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-base-200 px-5 py-4">
          <Search size={18} className="text-base-content/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].path);
            }}
            placeholder="Cari menu atau halaman..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-base-content/40"
          />
          <button className="btn btn-ghost btn-circle btn-xs shrink-0" onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-base-content/50">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </p>
          ) : (
            <ul className="space-y-0.5">
              {results.map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-base-content hover:bg-base-200 transition-colors"
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.group && (
                      <span className="text-[11px] text-base-content/50">{item.group}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

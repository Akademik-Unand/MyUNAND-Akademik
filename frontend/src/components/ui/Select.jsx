import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';

const SIZE_CLASS = {
  xs: 'input-xs text-xs min-h-8',
  sm: 'input-sm text-sm min-h-9',
  md: 'input-md min-h-10',
  lg: 'input-lg',
};

const PANEL_HEIGHT = 240;

const emitChange = (onChange, name, value) => {
  onChange?.({ target: { name, value } });
};

/**
 * Dropdown dengan kotak cari. API mengikuti select native (value + onChange event)
 * supaya form dan filter yang sudah ada tidak perlu diubah.
 */
export const Select = ({
  label,
  options = [],
  placeholder,
  className = '',
  selectClassName = '',
  size = 'md',
  value,
  defaultValue = '',
  onChange,
  name,
  disabled = false,
  required = false,
}) => {
  const isControlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const selected = isControlled ? value : inner;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [host, setHost] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const searchRef = useRef(null);

  const selectedLabel = options.find((opt) => String(opt.value) === String(selected))?.label;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (opt) =>
        String(opt.label).toLowerCase().includes(needle) ||
        String(opt.value).toLowerCase().includes(needle)
    );
  }, [options, query]);

  const placePanel = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nextHost = el.closest('dialog') || document.body;
    const hostRect = nextHost === document.body ? { top: 0, left: 0 } : nextHost.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < PANEL_HEIGHT && rect.top > PANEL_HEIGHT;
    setHost(nextHost);
    setCoords({
      top: openUp ? rect.top - hostRect.top - PANEL_HEIGHT : rect.bottom - hostRect.top + 4,
      left: rect.left - hostRect.left,
      width: Math.max(rect.width, 180),
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const choose = (next) => {
    if (!isControlled) setInner(next);
    emitChange(onChange, name, next);
    close();
  };

  const toggle = () => {
    if (disabled) return;
    if (open) {
      close();
      return;
    }
    placePanel();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    searchRef.current?.focus();
    const onDoc = (event) => {
      const target = event.target;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', placePanel);
    document.addEventListener('scroll', placePanel, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', placePanel);
      document.removeEventListener('scroll', placePanel, true);
    };
  }, [open, close, placePanel]);

  return (
    <fieldset className={`fieldset w-full gap-1 p-0 ${className}`}>
      {label && (
        <legend className="text-xs font-medium text-base-content/80">{label}</legend>
      )}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`input ${SIZE_CLASS[size] || SIZE_CLASS.md} flex w-full items-center justify-between gap-2 overflow-hidden text-left ${selectClassName}`}
        onClick={toggle}
      >
        <span className={`min-w-0 truncate ${selectedLabel ? 'text-base-content' : 'text-base-content/50'}`}>
          {selectedLabel || placeholder || 'Pilih'}
        </span>
        <ChevronDown size={14} className="shrink-0 opacity-50" />
      </button>
      {required && <input type="hidden" name={name} value={selected || ''} required />}

      {open &&
        host &&
        createPortal(
          <div
            ref={panelRef}
            className="rounded-box border border-base-300 bg-base-100 shadow-md"
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 80 }}
          >
            <label className="input input-sm m-2 w-[calc(100%-1rem)]">
              <Search size={14} className="opacity-50" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari..."
                aria-label="Cari pilihan"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filtered[0]) choose(filtered[0].value);
                  }
                }}
              />
            </label>
            <ul className="menu menu-sm max-h-52 overflow-y-auto p-1" role="listbox">
              {placeholder && !query && (
                <li>
                  <button type="button" onClick={() => choose('')}>
                    {placeholder}
                  </button>
                </li>
              )}
              {filtered.map((opt) => (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    className={String(opt.value) === String(selected) ? 'menu-active' : ''}
                    onClick={() => choose(opt.value)}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="disabled">
                  <span>Tidak ada hasil</span>
                </li>
              )}
            </ul>
          </div>,
          host
        )}
    </fieldset>
  );
};

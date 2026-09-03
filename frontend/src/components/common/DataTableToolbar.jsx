import { Filter, Search, X } from 'lucide-react';
import { ROWS_PER_PAGE_OPTIONS } from '../../hooks/table/useTablePagination';

export const DataTableToolbar = ({
  table,
  searchPlaceholder,
  hasFilters,
  filtersOpen,
  onToggleFilters,
  actions,
}) => {
  return (
    <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="input input-sm w-full sm:max-w-xs">
        <Search size={15} className="opacity-50" />
        <input
          type="search"
          value={table.draft}
          onChange={(e) => table.setDraft(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        {table.draft && (
          <button type="button" onClick={table.clear} aria-label="Bersihkan pencarian">
            <X size={14} className="opacity-50" />
          </button>
        )}
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {actions}

        {hasFilters && (
          <button
            type="button"
            className={`btn btn-sm gap-1.5 ${filtersOpen ? 'btn-primary' : 'btn-ghost'}`}
            onClick={onToggleFilters}
          >
            <Filter size={14} />
            Filter
            {table.activeCount > 0 && (
              <span className="badge badge-xs badge-neutral">{table.activeCount}</span>
            )}
          </button>
        )}

        <label className="flex items-center gap-1.5 text-xs text-base-content/60">
          Tampil
          <select
            className="select select-xs w-18"
            value={table.limit}
            onChange={(e) => table.setLimit(Number(e.target.value))}
            aria-label="Jumlah baris per halaman"
          >
            {ROWS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

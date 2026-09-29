import { RotateCcw, Search, X } from "lucide-react";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";

const asOptions = (options = []) =>
  options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

export const DataTableToolbar = ({
  table,
  searchPlaceholder,
  filterColumns = [],
  filterControls = [],
  onResetFilters,
  actions,
}) => {
  const hasFilters = filterColumns.length > 0 || filterControls.length > 0;
  const resetFilters = () => {
    table.clearFilters();
    onResetFilters?.();
  };

  return (
    <div className="flex flex-col gap-2 pb-2 xl:flex-row xl:items-end">
      <label className="input input-sm w-full xl:w-64 xl:shrink-0">
        <Search size={15} className="opacity-50" />
        <input
          type="search"
          value={table.draft}
          onChange={(e) => table.setDraft(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        {table.draft && (
          <button
            type="button"
            onClick={table.clear}
            aria-label="Bersihkan pencarian"
          >
            <X size={14} className="opacity-50" />
          </button>
        )}
      </label>

      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2 xl:justify-end">
        {filterColumns.map(({ column, value, onChange }) => (
          <fieldset key={column.key} className="fieldset w-full gap-1 p-0 sm:w-auto sm:min-w-36">
            <legend className="text-xs font-medium text-base-content/70">
              {column.filter.label || column.header}
            </legend>
            {column.filter.type === "select" ? (
              <Select
                size="sm"
                placeholder={column.filter.placeholder || "Semua"}
                options={asOptions(column.filter.options)}
                value={value}
                onChange={(event) => onChange(event.target.value)}
              />
            ) : (
              <input
                type="search"
                className="input input-sm w-full sm:w-36"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={column.filter.placeholder || "Filter..."}
                aria-label={`Filter ${column.header}`}
              />
            )}
          </fieldset>
        ))}
        {filterControls.map((field) => (
          <Select
            key={field.name || field.label}
            size="sm"
            className="w-full sm:w-auto sm:min-w-36"
            label={field.label}
            placeholder={field.placeholder || "Semua"}
            options={field.options || []}
            value={field.value}
            onChange={field.onChange}
            disabled={field.disabled}
          />
        ))}
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            aria-label="Reset semua filter"
            title="Reset semua filter"
          >
            <RotateCcw size={15} />
          </Button>
        )}
      </div>

      {actions}
    </div>
  );
};

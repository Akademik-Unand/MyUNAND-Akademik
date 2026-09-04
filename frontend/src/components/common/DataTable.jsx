import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Inbox } from 'lucide-react';
import { useTableParams } from '../../hooks/table/useTableParams';
import { useTableQuery } from '../../hooks/useTableQuery';
import { applyQuery } from '../../utils/queryRows';
import { DataTablePagination } from './DataTablePagination';
import { DataTableToolbar } from './DataTableToolbar';
import { Select } from '../ui/Select';
import { Skeleton } from '../ui/Skeleton';

const NO_ROWS = [];
const NO_FIELDS = [];

const SortIndicator = ({ active, order }) => {
  if (!active) return <ChevronsUpDown size={13} className="opacity-30" />;
  return order === 'desc' ? <ArrowDown size={13} /> : <ArrowUp size={13} />;
};

const ColumnFilter = ({ column, value, onChange }) => {
  const config = column.filter;
  if (!config) return null;

  if (config.type === 'select') {
    const options = config.options.map((option) =>
      typeof option === 'string' ? { value: option, label: option } : option
    );
    return (
      <Select
        size="xs"
        placeholder="Semua"
        options={options}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type="text"
      className="input input-xs w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={config.placeholder || 'Filter'}
      aria-label={`Filter ${column.header}`}
    />
  );
};

/**
 * Tabel data standar aplikasi. Semua parameter (halaman, jumlah baris,
 * pencarian, urutan, filter kolom) hidup di URL, jadi tampilan tabel bertahan
 * saat halaman di-refresh atau tautannya dibagikan.
 *
 * Mode server: berikan `resource`, data diambil lewat React Query.
 * Mode klien: berikan `rows`, penyaringan dilakukan lokal dengan aturan sama.
 */
export const DataTable = ({
  resource,
  rows: staticRows = NO_ROWS,
  data,
  columns = [],
  rowKey = (row, idx) => idx,
  searchPlaceholder = 'Cari data...',
  searchableFields = NO_FIELDS,
  paramPrefix = '',
  tableKey,
  defaultLimit = 10,
  striped = true,
  emptyText = 'Tidak ada data ditemukan.',
  toolbarActions,
  className = '',
  extraFilter,
}) => {
  const table = useTableParams({ prefix: tableKey || paramPrefix, defaultLimit });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sourceRows = data ?? staticRows;
  const isServerMode = Boolean(resource);
  const serverParams = useMemo(
    () => ({
      ...table.query,
      filter: { ...table.query.filter, ...extraFilter },
    }),
    [table.query, extraFilter]
  );
  const serverQuery = useTableQuery(resource, serverParams);

  const clientResult = useMemo(
    () => applyQuery(sourceRows, table.query, searchableFields),
    [sourceRows, table.query, searchableFields]
  );

  const rows = isServerMode ? serverQuery.rows : clientResult.data;
  const meta = isServerMode ? serverQuery.meta : clientResult.meta;
  const isLoading = isServerMode && serverQuery.isPending;
  const isFetching = isServerMode && serverQuery.isFetching && !serverQuery.isPending;

  const filterableColumns = columns.filter((column) => column.filter);
  const hasFilters = filterableColumns.length > 0;
  const start = (meta.page - 1) * meta.limit;

  return (
    <div className={`w-full ${className}`}>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        hasFilters={hasFilters}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
        actions={toolbarActions}
      />

      <div className={`overflow-x-auto ${isFetching ? 'opacity-60' : ''}`}>
        <table className={`table table-sm w-full border-collapse ${striped ? 'table-zebra' : ''}`}>
          <thead>
            <tr className="text-xs uppercase text-base-content/60">
              {columns.map((column, idx) => {
                const isSorted = column.sortable && table.sortBy === column.key;
                return (
                  <th key={idx} className={column.className}>
                    {column.sortable && column.key ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 uppercase hover:text-base-content"
                        onClick={() => table.toggleSort(column.key)}
                      >
                        {column.header}
                        <SortIndicator active={isSorted} order={table.sortOrder} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>

            {hasFilters && filtersOpen && (
              <tr className="bg-base-200/60">
                {columns.map((column, idx) => (
                  <th key={idx} className="py-1.5">
                    <ColumnFilter
                      column={column}
                      value={table.filter[column.key] ?? ''}
                      onChange={(value) => table.setFilter(column.key, value)}
                    />
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody className="text-sm text-base-content">
            {isLoading &&
              Array.from({ length: Math.min(meta.limit, 8) }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  {columns.map((_column, colIdx) => (
                    <td key={colIdx}>
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-base-content/50">
                    <Inbox size={28} className="opacity-40" />
                    <p className="text-sm">{emptyText}</p>
                    {(table.search || table.activeCount > 0) && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          table.clear();
                          table.clearFilters();
                        }}
                      >
                        Bersihkan pencarian &amp; filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((row, idx) => (
                <tr key={rowKey(row, start + idx)}>
                  {columns.map((column, colIdx) => (
                    <td key={colIdx} className={column.cellClassName}>
                      {column.render ? column.render(row, start + idx) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <DataTablePagination meta={meta} page={meta.page} onPageChange={table.setPage} />
    </div>
  );
};

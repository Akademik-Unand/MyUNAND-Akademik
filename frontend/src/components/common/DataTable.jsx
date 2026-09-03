import { useState } from 'react';

export const DataTable = ({
  columns = [],
  data = [],
  rowKey = (row, idx) => idx,
  pageSize = 10,
  striped = true,
  emptyText = 'Tidak ada data ditemukan.',
  className = '',
}) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * pageSize;
  const pageRows = data.slice(start, start + pageSize);

  const paginate = (dir) => {
    const next = safePage + dir;
    if (next < 0 || next >= totalPages) return;
    setPage(next);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className={`table table-sm table-hover w-full ${striped ? 'table-zebra' : ''} ${className}`}>
        <thead>
          <tr className="text-xs uppercase text-base-content/60">
            {columns.map((col, idx) => (
              <th key={idx} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm text-base-content">
          {pageRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-base-content/50">
                {emptyText}
              </td>
            </tr>
          ) : (
            pageRows.map((row, idx) => (
              <tr key={rowKey(row, start + idx)}>
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={col.cellClassName}>
                    {col.render ? col.render(row, start + idx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {data.length > pageSize && (
        <div className="flex items-center justify-between border-t border-base-200 mt-2 pt-3">
          <span className="text-xs text-base-content/60">
            Menampilkan {start + 1}-{Math.min(start + pageSize, data.length)} dari {data.length}
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm btn-ghost"
              onClick={() => paginate(-1)}
              disabled={safePage === 0}
            >
              ‹
            </button>
            <button className="join-item btn btn-sm btn-ghost">
              {safePage + 1}/{totalPages}
            </button>
            <button
              className="join-item btn btn-sm btn-ghost"
              onClick={() => paginate(1)}
              disabled={safePage >= totalPages - 1}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

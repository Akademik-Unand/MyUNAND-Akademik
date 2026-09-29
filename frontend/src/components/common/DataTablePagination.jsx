import { ChevronLeft, ChevronRight } from "lucide-react";
import { ROWS_PER_PAGE_OPTIONS } from "../../hooks/table/useTablePagination";

/** Menampilkan maksimal 5 nomor halaman yang mengelilingi halaman aktif. */
const buildPageList = (page, totalPages) => {
  const window = 5;
  let start = Math.max(1, page - Math.floor(window / 2));
  const end = Math.min(totalPages, start + window - 1);
  start = Math.max(1, end - window + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const DataTablePagination = ({
  meta,
  page,
  onPageChange,
  onLimitChange,
}) => {
  const { total, limit, totalPages } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-base-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-base-content/60">
        Menampilkan {from}-{to} dari {total} data
      </span>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <label className="flex items-center gap-1.5 text-xs text-base-content/60">
          Tampil
          <select
            className="select select-sm w-20"
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            aria-label="Jumlah baris per halaman"
          >
            {ROWS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>
        {totalPages > 1 && (
          <div className="join">
            <button
              type="button"
              className="join-item btn btn-sm btn-ghost"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={15} />
            </button>
            {buildPageList(page, totalPages).map((item) => (
              <button
                key={item}
                type="button"
                className={`join-item btn btn-sm ${item === page ? "btn-primary" : "btn-ghost"}`}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              className="join-item btn btn-sm btn-ghost"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

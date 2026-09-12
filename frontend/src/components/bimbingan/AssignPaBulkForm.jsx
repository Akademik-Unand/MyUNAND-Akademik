import { useMemo } from "react";
import { CheckSquare, Square } from "lucide-react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import {
  dosenLabel,
  mahasiswaLabel,
  unitLabel,
} from "../../helpers/bimbinganPa";

const cocok = (row, query) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [row.nama, row.niu, row.programStudi?.nama_singkat]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
};

/**
 * Penetapan massal: satu dosen untuk banyak mahasiswa sekaligus. Mahasiswa yang
 * unitnya berbeda dilewati oleh backend beserta alasannya.
 */
export const AssignPaBulkForm = ({
  values,
  onChange,
  rows = [],
  isLoading = false,
  dosenFilter,
  selectedIds = [],
  onToggle,
  onToggleAll,
  search,
  onSearchChange,
}) => {
  const setField = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });

  const dosenQuery = useResourceQuery("dosen", {
    params: { limit: 200, ...(dosenFilter ? { filter: dosenFilter } : {}) },
  });
  const dosenOptions = (dosenQuery.data || []).map((row) => ({
    value: row.id,
    label: dosenLabel(row),
  }));

  const terlihat = useMemo(
    () => rows.filter((row) => cocok(row, search)),
    [rows, search],
  );
  const terpilihSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const semuaTerlihatTerpilih =
    terlihat.length > 0 && terlihat.every((row) => terpilihSet.has(row.id));

  return (
    <div className="space-y-3">
      <Select
        label="Dosen PA"
        placeholder="Pilih dosen pembimbing"
        options={dosenOptions}
        value={values.dosen_id}
        onChange={setField("dosen_id")}
        disabled={dosenQuery.isPending}
      />

      <div className="rounded-box border border-base-300">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 px-3 py-2">
          <p className="text-xs font-medium text-base-content/80">
            Mahasiswa tanpa dosen PA
            <span className="ml-1 font-normal text-base-content/60">
              ({selectedIds.length} dipilih dari {rows.length})
            </span>
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-xs gap-1"
            onClick={() => onToggleAll(terlihat)}
            disabled={terlihat.length === 0}
          >
            {semuaTerlihatTerpilih ? (
              <CheckSquare size={13} />
            ) : (
              <Square size={13} />
            )}
            {semuaTerlihatTerpilih
              ? "Kosongkan pilihan"
              : "Pilih semua yang tampil"}
          </button>
        </div>

        <div className="px-3 py-2">
          <Input
            size="sm"
            placeholder="Cari nama, NIU, atau prodi..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="max-h-60 overflow-y-auto border-t border-base-200">
          {isLoading && (
            <p className="px-3 py-6 text-center text-xs text-base-content/60">
              Memuat mahasiswa tanpa dosen PA...
            </p>
          )}

          {!isLoading && terlihat.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-base-content/60">
              {rows.length === 0
                ? "Semua mahasiswa pada unit ini sudah punya dosen PA."
                : "Tidak ada mahasiswa yang cocok dengan pencarian."}
            </p>
          )}

          {!isLoading &&
            terlihat.map((row) => (
              <label
                key={row.id}
                className="flex cursor-pointer items-center gap-2.5 border-b border-base-200 px-3 py-2 last:border-b-0 hover:bg-base-200/50"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={terpilihSet.has(row.id)}
                  onChange={() => onToggle(row.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-base-content">
                    {mahasiswaLabel(row)}
                  </span>
                  <span className="block truncate text-xs text-base-content/60">
                    {unitLabel(row)}
                  </span>
                </span>
              </label>
            ))}
        </div>
      </div>

      <Input
        label="Tahun Akademik (opsional)"
        placeholder="2026/2027"
        value={values.tahun_akademik}
        onChange={setField("tahun_akademik")}
      />
      <Textarea
        label="Catatan (opsional)"
        rows={2}
        value={values.catatan}
        onChange={setField("catatan")}
      />
    </div>
  );
};

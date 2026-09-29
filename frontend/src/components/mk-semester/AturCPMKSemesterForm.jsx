import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { IconButton } from "../common/IconButton";
import { isLeafCpmk, MAX_MK_BOBOT } from "../../helpers/cpmkBobot";
import { totalAssessmentWeight } from "../../helpers/assessmentMatrix";

const newKey = () => `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const AturCPMKSemesterForm = ({
  items,
  columns,
  onChange,
  disabled = false,
}) => {
  const cpmks = items.filter((item) => isLeafCpmk(item, items));
  const total = totalAssessmentWeight(columns);
  const overMax = total > MAX_MK_BOBOT + 0.01;

  const updateColumn = (key, patch) =>
    onChange(columns.map((column) => column.key === key ? { ...column, ...patch } : column));

  const updateCell = (columnKey, cpmkId, patch) =>
    onChange(columns.map((column) => column.key !== columnKey ? column : {
      ...column,
      cells: {
        ...column.cells,
        [cpmkId]: { ...column.cells[cpmkId], ...patch },
      },
    }));

  const addColumn = () => onChange([
    ...columns,
    { key: newKey(), nama: "", cells: {} },
  ]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">Matriks komponen penilaian × CPMK</p>
          <p className="mt-1 text-sm text-base-content/60">
            Tambahkan komponen sebagai kolom, lalu centang CPMK yang dinilai dan isi bobotnya.
            Bobot total seluruh CPMK dalam mata kuliah maksimal 100%.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-1" disabled={disabled} onClick={addColumn}>
          <Plus size={14} /> Tambah Komponen
        </Button>
      </div>

      <div className="overflow-x-auto rounded-box border border-base-300">
        <table className="table table-sm min-w-max">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 min-w-64 bg-base-200">CPMK / Sub-CPMK</th>
              {columns.map((column) => (
                <th key={column.key} className="min-w-56 align-top">
                  <div className="flex items-end gap-2">
                    <label className="fieldset min-w-0 flex-1">
                      <span className="label text-xs">Nama Komponen</span>
                      <input
                        className="input input-sm w-full"
                        value={column.nama}
                        disabled={disabled}
                        placeholder="mis. Tugas 1"
                        onChange={(event) => updateColumn(column.key, { nama: event.target.value })}
                      />
                    </label>
                    <IconButton
                      label="Hapus komponen penilaian"
                      icon={Trash2}
                      tone="text-error"
                      disabled={disabled}
                      onClick={() => onChange(columns.filter((item) => item.key !== column.key))}
                    />
                  </div>
                </th>
              ))}
              {!columns.length && <th className="min-w-56 text-left font-normal text-base-content/60">Belum ada komponen.</th>}
            </tr>
          </thead>
          <tbody>
            {cpmks.map((cpmk) => (
              <tr key={cpmk.id}>
                <th className="sticky left-0 z-10 min-w-64 whitespace-normal bg-base-100">
                  <span className="block font-semibold">{cpmk.nama_cpmk}</span>
                  {cpmk.deskripsi && <span className="mt-1 block text-xs font-normal text-base-content/60">{cpmk.deskripsi}</span>}
                </th>
                {columns.map((column) => {
                  const cell = column.cells[cpmk.id];
                  const selected = Boolean(cell?.selected);
                  return (
                    <td key={column.key} className="min-w-56">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selected}
                          disabled={disabled}
                          aria-label={`Petakan ${column.nama || "komponen"} ke ${cpmk.nama_cpmk}`}
                          onChange={(event) => updateCell(column.key, cpmk.id, {
                            selected: event.target.checked,
                            bobot: cell?.bobot ?? 0,
                          })}
                        />
                        <label className="fieldset flex-1">
                          <span className="label text-xs">Bobot (%)</span>
                          <input
                            type="number"
                            min="0"
                            max={MAX_MK_BOBOT}
                            step="0.1"
                            className="input input-sm w-full"
                            value={cell?.bobot ?? 0}
                            disabled={disabled || !selected}
                            aria-label={`Bobot ${column.nama || "komponen"} untuk ${cpmk.nama_cpmk}`}
                            onChange={(event) => updateCell(column.key, cpmk.id, { bobot: Number(event.target.value) })}
                          />
                        </label>
                      </div>
                    </td>
                  );
                })}
                {!columns.length && <td className="text-sm text-base-content/50">Tambahkan komponen untuk mulai memetakan.</td>}
              </tr>
            ))}
            {!!columns.length && (
              <tr>
                <th className="sticky left-0 z-10 bg-base-200">Total bobot komponen</th>
                {columns.map((column) => {
                  const sum = Object.values(column.cells).reduce((value, cell) => value + (cell.selected ? Number(cell.bobot || 0) : 0), 0);
                  return <td key={column.key} className="font-medium tabular-nums">{sum.toLocaleString("id-ID")}%</td>;
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className={`text-sm ${overMax ? "text-error" : "text-base-content/60"}`}>
        Total bobot: <strong>{total.toLocaleString("id-ID")}</strong>% / {MAX_MK_BOBOT}%
        {overMax ? " — total tidak boleh lebih dari 100%." : ""}
      </p>
    </div>
  );
};

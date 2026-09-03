import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../common/IconButton';
import { SUMBER_PENILAIAN_OPTIONS } from '../../constants/mockData';

const newSumber = () => ({
  id: `s${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  nama: 'Tugas',
  custom: '',
  bobot: 5,
});

export const AturCPMKSemesterForm = ({ items, onChange }) => {
  const updateCpmk = (cpmkId, patch) => {
    onChange(items.map((item) => (item.id === cpmkId ? { ...item, ...patch } : item)));
  };

  const updateCpl = (cpmkId, cplId, patch) => {
    onChange(
      items.map((item) =>
        item.id === cpmkId
          ? { ...item, cpl: item.cpl.map((cpl) => (cpl.id === cplId ? { ...cpl, ...patch } : cpl)) }
          : item
      )
    );
  };

  const updateSumber = (cpmkId, cplId, sumberId, patch) => {
    onChange(
      items.map((item) =>
        item.id !== cpmkId
          ? item
          : {
              ...item,
              cpl: item.cpl.map((cpl) =>
                cpl.id !== cplId
                  ? cpl
                  : {
                      ...cpl,
                      sumber: cpl.sumber.map((row) => (row.id === sumberId ? { ...row, ...patch } : row)),
                    }
              ),
            }
      )
    );
  };

  const totalBobot = items
    .filter((item) => item.selected)
    .reduce(
      (sum, item) =>
        sum +
        item.cpl
          .filter((cpl) => cpl.selected)
          .reduce((inner, cpl) => inner + cpl.sumber.reduce((acc, row) => acc + Number(row.bobot || 0), 0), 0),
      0
    );

  return (
    <div className="space-y-6">
      {items.map((cpmk) => (
        <div key={cpmk.id} className="rounded-box border border-base-300 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary mt-1"
              checked={cpmk.selected}
              onChange={(e) => updateCpmk(cpmk.id, { selected: e.target.checked })}
            />
            <span>
              <strong>{cpmk.nama}</strong> — {cpmk.deskripsi}
            </span>
          </label>

          {cpmk.selected && (
            <div className="mt-4 space-y-4 pl-8">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <fieldset className="fieldset gap-1 p-0">
                  <legend className="fieldset-legend text-xs">Target Mencapai Nilai Minimal</legend>
                  <label className="input input-sm">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={cpmk.targetCapai}
                      onChange={(e) => updateCpmk(cpmk.id, { targetCapai: Number(e.target.value) })}
                    />
                    <span className="label">%</span>
                  </label>
                </fieldset>
                <fieldset className="fieldset gap-1 p-0">
                  <legend className="fieldset-legend text-xs">Target Nilai Minimal</legend>
                  <input
                    type="number"
                    className="input input-sm"
                    min="1"
                    max="100"
                    value={cpmk.targetNilai}
                    onChange={(e) => updateCpmk(cpmk.id, { targetNilai: Number(e.target.value) })}
                  />
                </fieldset>
                <fieldset className="fieldset gap-1 p-0">
                  <legend className="fieldset-legend text-xs">Skala Nilai</legend>
                  <select
                    className="select select-sm"
                    value={cpmk.skala}
                    onChange={(e) => updateCpmk(cpmk.id, { skala: e.target.value })}
                  >
                    <option value="100">Skala 100</option>
                    <option value="4">Skala 4</option>
                  </select>
                </fieldset>
              </div>

              {cpmk.cpl.map((cpl) => (
                <div key={cpl.id} className="rounded-box bg-base-200 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary mt-1"
                      checked={cpl.selected}
                      onChange={(e) => updateCpl(cpmk.id, cpl.id, { selected: e.target.checked })}
                    />
                    <span>
                      <strong>{cpl.kode}</strong> — {cpl.deskripsi}
                    </span>
                  </label>

                  {cpl.selected && (
                    <div className="mt-3 space-y-3">
                      {cpl.sumber.map((row, idx) => (
                        <div key={row.id} className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_8rem_auto]">
                          <fieldset className="fieldset gap-1 p-0">
                            <legend className="fieldset-legend text-xs">Sumber Penilaian #{idx + 1}</legend>
                            {row.nama === 'Lainnya' || row.custom ? (
                              <label className="input input-sm">
                                <input
                                  type="text"
                                  value={row.custom}
                                  onChange={(e) => updateSumber(cpmk.id, cpl.id, row.id, { custom: e.target.value })}
                                  placeholder="Nama sumber penilaian"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSumber(cpmk.id, cpl.id, row.id, { nama: 'Tugas', custom: '' })
                                  }
                                  aria-label="Kembali ke daftar"
                                >
                                  <X size={14} />
                                </button>
                              </label>
                            ) : (
                              <select
                                className="select select-sm"
                                value={row.nama}
                                onChange={(e) =>
                                  updateSumber(cpmk.id, cpl.id, row.id, {
                                    nama: e.target.value,
                                    custom: e.target.value === 'Lainnya' ? '' : row.custom,
                                  })
                                }
                              >
                                {SUMBER_PENILAIAN_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            )}
                          </fieldset>
                          <fieldset className="fieldset gap-1 p-0">
                            <legend className="fieldset-legend text-xs">Bobot #{idx + 1}</legend>
                            <label className="input input-sm">
                              <input
                                type="number"
                                min="0.01"
                                max="100"
                                step="0.01"
                                value={row.bobot}
                                onChange={(e) =>
                                  updateSumber(cpmk.id, cpl.id, row.id, { bobot: Number(e.target.value) })
                                }
                              />
                              <span className="label">%</span>
                            </label>
                          </fieldset>
                          <IconButton
                            label="Hapus sumber penilaian"
                            icon={Trash2}
                            tone="text-error"
                            onClick={() =>
                              updateCpl(cpmk.id, cpl.id, {
                                sumber: cpl.sumber.filter((item) => item.id !== row.id),
                              })
                            }
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="gap-1"
                        onClick={() => updateCpl(cpmk.id, cpl.id, { sumber: [...cpl.sumber, newSumber()] })}
                      >
                        <Plus size={13} /> Sumber Penilaian
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <p className="text-sm">
        Total bobot terpilih: <strong>{totalBobot}</strong>%
      </p>
    </div>
  );
};

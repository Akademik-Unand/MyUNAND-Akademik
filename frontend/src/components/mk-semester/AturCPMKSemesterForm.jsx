import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../common/IconButton';
import { Input } from '../ui/Input';
import { isLeafCpmk, MAX_MK_BOBOT, totalBobotMataKuliah } from '../../helpers/cpmkBobot';

const newSumber = () => ({ id: `new-${Date.now()}`, nama_sumber_penilaian: '', bobot: 0, isNew: true });

export const AturCPMKSemesterForm = ({ items, onChange }) => {
  const updateCpmk = (cpmkId, patch) => {
    onChange(items.map((item) => (item.id === cpmkId ? { ...item, ...patch } : item)));
  };

  const updateSumber = (cpmkId, sumberId, patch) => {
    onChange(
      items.map((item) =>
        item.id !== cpmkId
          ? item
          : {
              ...item,
              sumberPenilaian: (item.sumberPenilaian || []).map((row) =>
                row.id === sumberId ? { ...row, ...patch } : row
              ),
            }
      )
    );
  };

  const totalBobot = totalBobotMataKuliah(items);
  const overMax = totalBobot > MAX_MK_BOBOT;

  return (
    <div className="space-y-4">
      {items.map((cpmk) => {
        const leaf = isLeafCpmk(cpmk, items);
        return (
          <div key={cpmk.id} className="rounded-box border border-base-300 p-4">
            <p>
              <strong>{cpmk.nama_cpmk}</strong> — {cpmk.deskripsi || '—'}
            </p>
            {!leaf && (
              <p className="mt-2 text-sm text-base-content/60">
                CPMK ini punya Sub-CPMK. Bobot hanya diisi pada Sub-CPMK.
              </p>
            )}
            {leaf && (
              <div className="mt-4 space-y-3">
                {(cpmk.sumberPenilaian || []).map((row, idx) => (
                  <div key={row.id} className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_8rem_auto]">
                    <Input
                      label={`Sumber penilaian #${idx + 1}`}
                      value={row.nama_sumber_penilaian || ''}
                      onChange={(e) =>
                        updateSumber(cpmk.id, row.id, { nama_sumber_penilaian: e.target.value })
                      }
                    />
                    <Input
                      label={`Bobot #${idx + 1} (%)`}
                      type="number"
                      min={0}
                      max={MAX_MK_BOBOT}
                      step="0.1"
                      value={row.bobot ?? 0}
                      onChange={(e) => updateSumber(cpmk.id, row.id, { bobot: Number(e.target.value) })}
                    />
                    <IconButton
                      label="Hapus sumber penilaian"
                      icon={Trash2}
                      tone="text-error"
                      onClick={() =>
                        updateCpmk(cpmk.id, {
                          sumberPenilaian: (cpmk.sumberPenilaian || []).filter((item) => item.id !== row.id),
                          removedSumber: [...(cpmk.removedSumber || []), row].filter((item) => !item.isNew),
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
                  onClick={() =>
                    updateCpmk(cpmk.id, { sumberPenilaian: [...(cpmk.sumberPenilaian || []), newSumber()] })
                  }
                >
                  <Plus size={13} /> Sumber Penilaian
                </Button>
              </div>
            )}
          </div>
        );
      })}
      <p className={`text-sm ${overMax ? 'text-error' : ''}`}>
        Total bobot: <strong>{totalBobot}</strong>% / {MAX_MK_BOBOT}%
        {overMax ? ' — total tidak boleh lebih dari 100%.' : ''}
      </p>
    </div>
  );
};

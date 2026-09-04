import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../common/IconButton';
import { Input } from '../ui/Input';

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

  const totalBobot = items.reduce(
    (sum, item) =>
      sum + (item.sumberPenilaian || []).reduce((inner, row) => inner + Number(row.bobot || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {items.map((cpmk) => (
        <div key={cpmk.id} className="rounded-box border border-base-300 p-4">
          <p>
            <strong>{cpmk.nama_cpmk}</strong> — {cpmk.deskripsi || '—'}
          </p>
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
                  label={`Bobot #${idx + 1}`}
                  type="number"
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
        </div>
      ))}
      <p className="text-sm">
        Total bobot: <strong>{totalBobot}</strong>%
      </p>
    </div>
  );
};

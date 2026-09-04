import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../common/IconButton';
import { CpmkForm } from './CpmkForm';
import { emptyCpmkRow } from '../../helpers/cpmkForm';

/** Daftar isian CPMK untuk bulk create; tiap baris = satu CPMK lengkap (bisa ber-Sub-CPMK). */
export const BulkCpmkFields = ({ rows = [], onChange, kurikulumId }) => {
  const updateAt = (index, patch) =>
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-4">
      <p className="text-xs text-base-content/60">
        Isi beberapa CPMK sekaligus lalu simpan sekali. Setiap baris boleh langsung dipetakan ke SCP
        atau memiliki Sub-CPMK sendiri.
      </p>
      {rows.map((r, index) => (
        <div key={r.key || index} className="space-y-3 rounded-box border border-base-300 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">CPMK {index + 1}</p>
            {rows.length > 1 && (
              <IconButton
                label={`Hapus CPMK ${index + 1}`}
                icon={Trash2}
                tone="text-error"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              />
            )}
          </div>
          <CpmkForm
            values={r}
            onChange={(next) => updateAt(index, next)}
            showHasSub
            showScp={!r.has_sub}
            scpRequired={!r.has_sub}
            kurikulumId={kurikulumId}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => onChange([...rows, emptyCpmkRow()])}
      >
        <Plus size={15} /> Tambah CPMK lagi
      </Button>
    </div>
  );
};

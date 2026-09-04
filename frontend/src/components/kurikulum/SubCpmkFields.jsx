import { Plus, Trash2 } from 'lucide-react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { IconButton } from '../common/IconButton';
import { ScpPicker } from './ScpPicker';
import { emptySubCpmk } from '../../helpers/cpmkForm';

export const SubCpmkFields = ({ items = [], onChange, kurikulumId }) => {
  const updateAt = (index, patch) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-base-content/80">Sub-CPMK *</p>
      <p className="text-xs text-base-content/60">
        Setiap Sub-CPMK dipetakan ke SCP. Tambah baris jika perlu lebih dari satu.
      </p>
      {items.map((item, index) => (
        <div key={item.key || index} className="space-y-3 rounded-box border border-base-300 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">Sub-CPMK {index + 1}</p>
            {items.length > 1 && (
              <IconButton
                label="Hapus Sub-CPMK"
                icon={Trash2}
                tone="text-error"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              />
            )}
          </div>
          <Input
            label="Nama *"
            value={item.nama_cpmk || ''}
            onChange={(e) => updateAt(index, { nama_cpmk: e.target.value })}
            placeholder={`Sub-CPMK ${index + 1}`}
            required
          />
          <Textarea
            label="Deskripsi *"
            rows={3}
            value={item.deskripsi || ''}
            onChange={(e) => updateAt(index, { deskripsi: e.target.value })}
            required
          />
          <ScpPicker
            kurikulumId={kurikulumId}
            value={item.scp_ids || []}
            required
            onChange={(scp_ids) => updateAt(index, { scp_ids })}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => onChange([...items, emptySubCpmk()])}
      >
        <Plus size={15} /> Tambah Sub-CPMK
      </Button>
    </div>
  );
};

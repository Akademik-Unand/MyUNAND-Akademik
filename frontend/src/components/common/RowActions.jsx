import { Eye, Pencil, Trash2 } from 'lucide-react';
import { IconButton } from './IconButton';

export const RowActions = ({ onDetail, onEdit, onDelete, extra }) => {
  return (
    <div className="flex items-center justify-end gap-1">
      {onDetail && (
        <IconButton label="Lihat detail" icon={Eye} tone="text-info" onClick={onDetail} />
      )}
      {onEdit && <IconButton label="Ubah data" icon={Pencil} tone="text-warning" onClick={onEdit} />}
      {onDelete && (
        <IconButton label="Hapus data" icon={Trash2} tone="text-error" onClick={onDelete} />
      )}
      {extra}
    </div>
  );
};

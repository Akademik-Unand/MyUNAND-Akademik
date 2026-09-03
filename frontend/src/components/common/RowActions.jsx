import { Eye, Pencil, Trash2 } from 'lucide-react';

export const RowActions = ({ onDetail, onEdit, onDelete, extra }) => {
  return (
    <div className="flex items-center gap-1 justify-end">
      {onDetail && (
        <button type="button" className="btn btn-xs btn-ghost text-info" title="Detail" onClick={onDetail}>
          <Eye size={14} />
        </button>
      )}
      {onEdit && (
        <button type="button" className="btn btn-xs btn-ghost text-warning" title="Edit" onClick={onEdit}>
          <Pencil size={14} />
        </button>
      )}
      {onDelete && (
        <button type="button" className="btn btn-xs btn-ghost text-error" title="Hapus" onClick={onDelete}>
          <Trash2 size={14} />
        </button>
      )}
      {extra}
    </div>
  );
};

import { Fragment, useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import { IconButton, IconLink } from '../common/IconButton';
import { Badge } from '../ui/Badge';
import { Can } from '../auth/Can';

const ScpBadges = ({ items }) => {
  if (!items?.length) return '—';
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((scp) => (
        <Badge key={scp.id} variant="ghost" wrap>
          {scp.nama_scp}
        </Badge>
      ))}
    </div>
  );
};

export const CpmkKelolaTable = ({ roots, childrenByParent, mkId, suffix, onDelete }) => {
  const [openIds, setOpenIds] = useState(() => new Set());

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Deskripsi</th>
            <th>SCP terkait</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {roots.map((item) => {
            const children = childrenByParent.get(item.id) || [];
            const open = openIds.has(item.id);
            return (
              <Fragment key={item.id}>
                <tr>
                  <td>
                    <div className="space-y-1">
                      <p className="font-semibold">{item.nama_cpmk}</p>
                      {children.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs gap-1 px-1"
                          onClick={() => toggle(item.id)}
                        >
                          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          {open ? 'Sembunyikan Sub-CPMK' : `Lihat ${children.length} Sub-CPMK`}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>{item.deskripsi || '—'}</td>
                  <td>
                    <ScpBadges items={children.length ? [] : item.scp} />
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {children.length > 0 && (
                        <Can I="create" a="Cpmk">
                          <IconLink
                            label="Tambah Sub-CPMK"
                            icon={Plus}
                            to={`/kurikulum/cpmk/${mkId}/${item.id}/sub/baru${suffix}`}
                          />
                        </Can>
                      )}
                      <Can I="update" a="Cpmk">
                        <IconLink
                          label="Ubah CPMK"
                          icon={Pencil}
                          tone="text-warning"
                          to={`/kurikulum/cpmk/${mkId}/${item.id}/edit${suffix}`}
                        />
                      </Can>
                      <Can I="delete" a="Cpmk">
                        <IconButton
                          label="Hapus CPMK"
                          icon={Trash2}
                          tone="text-error"
                          tooltipPosition="tooltip-left"
                          onClick={() => onDelete(item)}
                        />
                      </Can>
                    </div>
                  </td>
                </tr>
                {open &&
                  children.map((child) => (
                    <tr key={child.id} className="bg-base-200/40">
                      <td className="pl-8">{child.nama_cpmk}</td>
                      <td>{child.deskripsi || '—'}</td>
                      <td>
                        <ScpBadges items={child.scp} />
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Can I="update" a="Cpmk">
                            <IconLink
                              label="Ubah Sub-CPMK"
                              icon={Pencil}
                              tone="text-warning"
                              to={`/kurikulum/cpmk/${mkId}/${child.id}/edit${suffix}`}
                            />
                          </Can>
                          <Can I="delete" a="Cpmk">
                            <IconButton
                              label="Hapus Sub-CPMK"
                              icon={Trash2}
                              tone="text-error"
                              tooltipPosition="tooltip-left"
                              onClick={() => onDelete(child)}
                            />
                          </Can>
                        </div>
                      </td>
                    </tr>
                  ))}
              </Fragment>
            );
          })}
          {roots.length === 0 && (
            <tr>
              <td colSpan={4} className="text-sm text-base-content/60">
                Belum ada CPMK. Tambah CPMK, pilih apakah punya Sub-CPMK, lalu petakan ke CP/SCP.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

import { Fragment } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { IconButton, IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { useResourceItem, useResourceQuery } from '../../hooks/useResourceQuery';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useConfirmDelete } from '../../hooks/useConfirmDelete';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { Can } from '../../components/auth/Can';

const querySuffix = (kurikulumId) => (kurikulumId ? `?kurikulum_id=${kurikulumId}` : '');

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

export const AturCPMKPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const kurikulumId = params.get('kurikulum_id') || '';
  const suffix = querySuffix(kurikulumId);
  const mk = useResourceItem('matakuliah', id);
  const query = useResourceQuery('cpmk-detail', {
    params: id ? { filter: { matakuliah_id: id } } : {},
    enabled: Boolean(id),
  });
  const mutations = useResourceMutations('cpmk-detail', {
    remove: 'CPMK berhasil dihapus.',
  });
  const del = useConfirmDelete();
  const data = query.data ?? [];
  const byId = new Map(data.map((item) => [item.id, item]));
  const roots = data.filter((item) => !item.parent_cpmk_id || !byId.has(item.parent_cpmk_id));

  if (mk.isPending || query.isPending) return <PageSkeleton showFilter={false} tableCols={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola CPMK"
        subtitle={`${mk.data?.nama_resmi || ''} | ${mk.data?.kode_matakuliah || ''} | ${mk.data?.jumlah_sks_kurikulum || 0} sks`}
        breadcrumbs={[
          { label: 'Kurikulum' },
          { label: 'CPMK Kurikulum', path: '/kurikulum/cpmk' },
          { label: 'Kelola CPMK' },
        ]}
        action={
          <div className="flex gap-2">
            <Can I="read" a="MatakuliahKurikulum">
              <Link to={`/perkuliahan/mk-semester/${id}`}>
                <Button variant="secondary" size="sm">
                  Lihat MK Semester
                </Button>
              </Link>
            </Can>
            <Can I="create" a="Cpmk">
              <Link to={`/kurikulum/cpmk/${id}/baru${suffix}`}>
                <Button size="sm" className="gap-1.5">
                  <Plus size={15} /> Tambah CPMK
                </Button>
              </Link>
            </Can>
          </div>
        }
      />

      <Card>
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
                const children = data.filter((row) => row.parent_cpmk_id === item.id);
                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td className="font-semibold">{item.nama_cpmk}</td>
                      <td>{item.deskripsi || '—'}</td>
                      <td>
                        <ScpBadges items={item.scp} />
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Can I="create" a="Cpmk">
                            <IconLink
                              label="Tambah Sub-CPMK"
                              icon={Plus}
                              to={`/kurikulum/cpmk/${id}/${item.id}/sub/baru${suffix}`}
                            />
                          </Can>
                          <Can I="update" a="Cpmk">
                            <IconLink
                              label="Ubah CPMK"
                              icon={Pencil}
                              tone="text-warning"
                              to={`/kurikulum/cpmk/${id}/${item.id}/edit${suffix}`}
                            />
                          </Can>
                          <Can I="delete" a="Cpmk">
                            <IconButton
                              label="Hapus CPMK"
                              icon={Trash2}
                              tone="text-error"
                              tooltipPosition="tooltip-left"
                              onClick={() => del.askDelete(item)}
                            />
                          </Can>
                        </div>
                      </td>
                    </tr>
                    {children.map((child) => (
                      <tr key={child.id}>
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
                                to={`/kurikulum/cpmk/${id}/${child.id}/edit${suffix}`}
                              />
                            </Can>
                            <Can I="delete" a="Cpmk">
                              <IconButton
                                label="Hapus Sub-CPMK"
                                icon={Trash2}
                                tone="text-error"
                                tooltipPosition="tooltip-left"
                                onClick={() => del.askDelete(child)}
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
        <div className="mt-4">
          <Link to="/kurikulum/cpmk" className="btn btn-ghost btn-sm">
            Kembali
          </Link>
        </div>
      </Card>

      <ConfirmDeleteModal
        open={del.isOpen}
        onClose={del.close}
        isLoading={del.pending}
        onConfirm={() => del.confirm((item) => mutations.remove.mutateAsync(item.id))}
      />
    </div>
  );
};

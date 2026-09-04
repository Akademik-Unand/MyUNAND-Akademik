import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { CpmkKelolaTable } from '../../components/kurikulum/CpmkKelolaTable';
import { useResourceItem, useResourceQuery } from '../../hooks/useResourceQuery';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useConfirmDelete } from '../../hooks/useConfirmDelete';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { Can } from '../../components/auth/Can';
import { useCpmkPeriodOpen } from '../../hooks/usePeriodes';

const querySuffix = (kurikulumId) => (kurikulumId ? `?kurikulum_id=${kurikulumId}` : '');

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
  const cpmkOpen = useCpmkPeriodOpen().open;
  const data = (query.data ?? []).filter((item) => item.matakuliah_id === id);
  const { roots, childrenByParent } = useMemo(() => {
    const byId = new Map(data.map((item) => [item.id, item]));
    const grouped = new Map();
    for (const item of data) {
      if (!item.parent_cpmk_id || !byId.has(item.parent_cpmk_id)) continue;
      const list = grouped.get(item.parent_cpmk_id) || [];
      list.push(item);
      grouped.set(item.parent_cpmk_id, list);
    }
    return {
      roots: data.filter((item) => !item.parent_cpmk_id || !byId.has(item.parent_cpmk_id)),
      childrenByParent: grouped,
    };
  }, [data]);

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
            {cpmkOpen && (
              <Can I="create" a="Cpmk">
                <Link to={`/kurikulum/cpmk/${id}/baru${suffix}`}>
                  <Button size="sm" className="gap-1.5">
                    <Plus size={15} /> Tambah CPMK
                  </Button>
                </Link>
              </Can>
            )}
          </div>
        }
      />

      <Card>
        <CpmkKelolaTable
          roots={roots}
          childrenByParent={childrenByParent}
          mkId={id}
          suffix={suffix}
          onDelete={del.askDelete}
          canMutate={cpmkOpen}
        />
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

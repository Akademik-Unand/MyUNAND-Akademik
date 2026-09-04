import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { IconButton, IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { Can } from '../../components/auth/Can';
import { useResourceMutations } from '../../hooks/useResourceMutations';

export const LaporanCPPage = () => {
  const mutations = useResourceMutations('laporan-cp', { remove: 'Laporan CP berhasil dihapus.' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    {
      key: 'nama_laporan',
      header: 'Nama Laporan',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium">{row.nama_laporan}</div>
          <div className="text-xs text-base-content/50">Last Edited: {row.updatedAt}</div>
        </div>
      ),
    },
    { key: 'keterangan', header: 'Keterangan' },
    {
      key: 'dibuat_oleh',
      header: 'Dibuat Oleh',
      render: (row) => row.pembuat?.name || '—',
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconLink label="Lihat laporan" icon={Eye} tone="text-info" to={`/perkuliahan/laporan-cp/${row.id}`} />
          <Can I="update" a="LaporanCp">
            <IconLink label="Ubah laporan" icon={Pencil} tone="text-warning" to={`/perkuliahan/laporan-cp/${row.id}/edit`} />
          </Can>
          <Can I="delete" a="LaporanCp">
            <IconButton
              label="Hapus laporan"
              icon={Trash2}
              tone="text-error"
              tooltipPosition="tooltip-left"
              onClick={() => setDeleteTarget(row)}
            />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan CP"
        subtitle="Kumpulkan dan tinjau laporan capaian pembelajaran"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Laporan CP' }]}
        action={
          <Can I="create" a="LaporanCp">
            <Link to="/perkuliahan/laporan-cp/baru">
              <Button size="sm" className="gap-1.5">
                <Plus size={15} /> Tambah Laporan CP
              </Button>
            </Link>
          </Can>
        }
      />
      <Card title="Daftar Laporan">
        <DataTable
          resource="laporan-cp"
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama laporan atau pembuat..."
        />
      </Card>
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Laporan CP"
        message={`Yakin ingin menghapus laporan ${deleteTarget?.nama_laporan || ''}?`}
        onConfirm={async () => {
          await mutations.remove.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isLoading={mutations.remove.isPending}
      />
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton, IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import { useResourceMutations } from '../../hooks/useResourceMutations';
import { useResourceQuery } from '../../hooks/useResourceQuery';

export const SettingSemesterPage = () => {
  const mutations = useResourceMutations('setting-semester', {
    remove: 'Setting semester berhasil dihapus.',
  });
  const allRows = useResourceQuery('setting-semester');
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activating, setActivating] = useState(false);

  const activate = async (row) => {
    if (activating) return;
    setActivating(true);
    try {
      const rows = allRows.data ?? [];
      for (const item of rows) {
        const next = item.id === row.id;
        if (Boolean(item.is_aktif) === next) continue;
        await mutations.update.mutateAsync({ id: item.id, payload: { is_aktif: next } });
      }
      toast.success(`${row.jenisSemester?.nama || 'Semester'} ${row.tahun} diaktifkan`);
    } catch (err) {
      toast.error(err.message || 'Gagal mengaktifkan semester');
    } finally {
      setActivating(false);
    }
  };

  const columns = [
    { key: 'tahun', header: 'Tahun', sortable: true },
    {
      key: 'jenis_semester_id',
      header: 'Jenis',
      sortable: true,
      render: (row) => row.jenisSemester?.nama || row.jenisSemester?.alias || '—',
    },
    {
      key: 'is_aktif',
      header: 'Status',
      sortable: true,
      render: (row) =>
        row.is_aktif ? (
          <span className="badge badge-success badge-sm">Aktif</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Tidak Aktif</span>
        ),
    },
    { key: 'tanggal_mulai', header: 'Mulai', sortable: true },
    { key: 'tanggal_selesai', header: 'Selesai', sortable: true },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton label="Lihat detail" icon={Eye} tone="text-info" onClick={() => setDetail(row)} />
          {!row.is_aktif && (
            <IconButton
              label="Aktifkan semester"
              icon={Power}
              tone="text-success"
              onClick={() => activate(row)}
            />
          )}
          <IconLink
            label="Ubah setting"
            icon={Pencil}
            tone="text-warning"
            to={`/master/semester/setting/${row.id}/edit`}
          />
          <IconButton
            label="Hapus setting"
            icon={Trash2}
            tone="text-error"
            tooltipPosition="tooltip-left"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Setting Semester"
        subtitle="Kelola semester aktif pada SIAKAD Kurikulum"
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Semester' }, { label: 'Setting Semester' }]}
        action={
          <Link to="/master/semester/setting/baru">
            <Button size="sm" className="gap-1.5 font-semibold">
              <Plus size={15} /> Tambahkan Data
            </Button>
          </Link>
        }
      />

      <Card title="Daftar Setting Semester">
        <DataTable
          resource="setting-semester"
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari tahun ajaran atau semester..."
        />
      </Card>

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Detail Setting Semester"
        subtitle={detail ? `${detail.jenisSemester?.nama || ''} ${detail.tahun}` : ''}
      >
        {detail && (
          <DetailList
            items={[
              { label: 'Tahun', value: detail.tahun },
              { label: 'Jenis', value: detail.jenisSemester?.nama },
              { label: 'Status', value: detail.is_aktif ? 'Aktif' : 'Tidak Aktif' },
              { label: 'Mulai', value: detail.tanggal_mulai },
              { label: 'Selesai', value: detail.tanggal_selesai },
            ]}
          />
        )}
      </Drawer>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Setting Semester"
        message={
          deleteTarget
            ? `Yakin ingin menghapus ${deleteTarget.jenisSemester?.nama || 'semester'} ${deleteTarget.tahun}?`
            : ''
        }
        onConfirm={async () => {
          await mutations.remove.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isLoading={mutations.remove.isPending}
      />
    </div>
  );
};

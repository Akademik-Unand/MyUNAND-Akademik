import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton, IconLink } from '../components/common/IconButton';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/common/DataTable';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { Drawer } from '../components/ui/Drawer';
import { DetailList } from '../components/common/DetailList';
import { useResourceMutations } from '../hooks/useResourceMutations';
import { useResourceQuery } from '../hooks/useResourceQuery';

export const SettingSemesterPage = () => {
  const mutations = useResourceMutations('setting-semester', {
    remove: 'Setting semester berhasil dihapus.',
  });
  const allRows = useResourceQuery('setting-semester');
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Hanya satu semester boleh aktif, jadi seluruh baris ditulis ulang sekaligus.
  const activate = (row) => {
    const rows = (allRows.data ?? []).map((item) => ({
      ...item,
      status: item.id === row.id ? 'Aktif' : 'Tidak Aktif',
    }));
    mutations.replaceAll.mutate(rows, {
      onSuccess: () => toast.success(`${row.semester} ${row.tahun} diaktifkan`),
    });
  };

  const columns = [
    { key: 'tahun', header: 'Tahun Ajaran', sortable: true },
    {
      key: 'semester',
      header: 'Semester',
      sortable: true,
      filter: { type: 'select', options: ['Ganjil', 'Genap', 'Pendek'] },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filter: { type: 'select', options: ['Aktif', 'Tidak Aktif'] },
      render: (row) =>
        row.status === 'Aktif' ? (
          <span className="badge badge-success badge-sm">Aktif</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Tidak Aktif</span>
        ),
    },
    { key: 'periodeMulai', header: 'Mulai', sortable: true },
    { key: 'periodeSelesai', header: 'Selesai', sortable: true },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton label="Lihat detail" icon={Eye} tone="text-info" onClick={() => setDetail(row)} />
          {row.status !== 'Aktif' && (
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
          rowKey={(r) => r.id}
          searchPlaceholder="Cari tahun ajaran atau semester..."
        />
      </Card>

      <Drawer
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Detail Setting Semester"
        subtitle={detail ? `${detail.semester} ${detail.tahun}` : ''}
      >
        {detail && (
          <DetailList
            items={[
              { label: 'Tahun ajaran', value: detail.tahun },
              { label: 'Semester', value: detail.semester },
              { label: 'Status', value: detail.status },
              { label: 'Periode', value: `${detail.periodeMulai} — ${detail.periodeSelesai}` },
              { label: 'Rencana studi', value: `${detail.rencanaMulai} — ${detail.rencanaSelesai}` },
              { label: 'Ubah KRS', value: `${detail.ubahMulai} — ${detail.ubahSelesai}` },
              { label: 'Input nilai', value: `${detail.nilaiMulai} — ${detail.nilaiSelesai}` },
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
            ? `Yakin ingin menghapus setting ${deleteTarget.semester} ${deleteTarget.tahun}?`
            : ''
        }
        onConfirm={() => {
          mutations.remove.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};

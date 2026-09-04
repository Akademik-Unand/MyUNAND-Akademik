import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { IconButton, IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/common/DataTable';
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import { useResourceMutations } from '../../hooks/useResourceMutations';

export const ProdiPage = () => {
  const mutations = useResourceMutations('prodi', { remove: 'Program studi berhasil dihapus.' });
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: 'kode', header: 'Kode Prodi', sortable: true },
    {
      key: 'jenjang',
      header: 'Jenjang',
      sortable: true,
      filter: { type: 'select', options: ['S1', 'S2', 'S3', 'D3'] },
    },
    { key: 'univ', header: 'Universitas ID', sortable: true },
    { key: 'fakultas', header: 'Fakultas ID', sortable: true },
    { key: 'departemen', header: 'Departemen ID', sortable: true },
    { key: 'nama', header: 'Nama Resmi', sortable: true },
    { key: 'singkat', header: 'Nama Singkat', sortable: true },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <IconButton label="Lihat detail" icon={Eye} tone="text-info" onClick={() => setDetail(row)} />
          <IconLink
            label="Ubah prodi"
            icon={Pencil}
            tone="text-warning"
            to={`/master/prodi/${encodeURIComponent(row.kode)}/edit`}
          />
          <IconButton
            label="Hapus prodi"
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
        title="Program Studi"
        subtitle="Kelola data program studi pada SIAKAD Kurikulum"
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Program Studi' }]}
        action={
          <Link to="/master/prodi/baru">
            <Button size="sm" className="gap-1.5 font-semibold">
              <Plus size={15} /> Tambahkan Data
            </Button>
          </Link>
        }
      />

      <Card title="Daftar Program Studi">
        <DataTable
          resource="prodi"
          columns={columns}
          rowKey={(r) => r.kode}
          searchPlaceholder="Cari kode atau nama prodi..."
        />
      </Card>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Program Studi" subtitle={detail?.kode}>
        {detail && (
          <DetailList
            items={[
              { label: 'Kode', value: detail.kode },
              { label: 'Jenjang', value: detail.jenjang },
              { label: 'Model ID', value: detail.model },
              { label: 'Universitas ID', value: detail.univ },
              { label: 'Fakultas ID', value: detail.fakultas },
              { label: 'Departemen ID', value: detail.departemen },
              { label: 'Nama resmi', value: detail.nama },
              { label: 'Nama singkat', value: detail.singkat },
            ]}
          />
        )}
      </Drawer>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Program Studi"
        message={`Yakin ingin menghapus prodi ${deleteTarget?.nama || ''}?`}
        onConfirm={async () => {
          await mutations.remove.mutateAsync(deleteTarget.kode);
          setDeleteTarget(null);
        }}
        isLoading={mutations.remove.isPending}
      />
    </div>
  );
};

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
import { Can } from '../../components/auth/Can';
import { useResourceMutations } from '../../hooks/useResourceMutations';

export const ProdiPage = () => {
  const mutations = useResourceMutations('prodi', { remove: 'Program studi berhasil dihapus.' });
  const [detail, setDetail] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const columns = [
    { key: 'kode_prodi', header: 'Kode Prodi', sortable: true },
    {
      key: 'jenjang_akademik_id',
      header: 'Jenjang',
      sortable: true,
      render: (row) => row.jenjangAkademik?.nama_jenjang || row.jenjangAkademik?.kode_jenjang || '—',
    },
    {
      key: 'fakultas_id',
      header: 'Fakultas',
      sortable: true,
      render: (row) => row.fakultas?.nama_resmi || '—',
    },
    {
      key: 'departemen_id',
      header: 'Departemen',
      sortable: true,
      render: (row) => row.departemen?.nama_resmi || '—',
    },
    { key: 'nama_resmi', header: 'Nama Resmi', sortable: true },
    { key: 'nama_singkat', header: 'Nama Singkat', sortable: true },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <IconButton label="Lihat detail" icon={Eye} tone="text-info" onClick={() => setDetail(row)} />
          <Can I="update" a="ProgramStudi">
            <IconLink label="Ubah prodi" icon={Pencil} tone="text-warning" to={`/master/prodi/${row.id}/edit`} />
          </Can>
          <Can I="delete" a="ProgramStudi">
            <IconButton
              label="Hapus prodi"
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
        title="Program Studi"
        subtitle="Kelola data program studi pada SIAKAD Kurikulum"
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Program Studi' }]}
        action={
          <Can I="create" a="ProgramStudi">
            <Link to="/master/prodi/baru">
              <Button size="sm" className="gap-1.5 font-semibold">
                <Plus size={15} /> Tambahkan Data
              </Button>
            </Link>
          </Can>
        }
      />

      <Card title="Daftar Program Studi">
        <DataTable
          resource="prodi"
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari kode atau nama prodi..."
        />
      </Card>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Program Studi" subtitle={detail?.kode_prodi}>
        {detail && (
          <DetailList
            items={[
              { label: 'Kode', value: detail.kode_prodi },
              { label: 'Jenjang', value: detail.jenjangAkademik?.nama_jenjang },
              { label: 'Model', value: detail.modelKurikulum?.nama },
              { label: 'Universitas', value: detail.universitas?.nama_resmi },
              { label: 'Fakultas', value: detail.fakultas?.nama_resmi },
              { label: 'Departemen', value: detail.departemen?.nama_resmi },
              { label: 'Nama resmi', value: detail.nama_resmi },
              { label: 'Nama singkat', value: detail.nama_singkat },
            ]}
          />
        )}
      </Drawer>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Program Studi"
        message={`Yakin ingin menghapus prodi ${deleteTarget?.nama_resmi || ''}?`}
        onConfirm={async () => {
          await mutations.remove.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isLoading={mutations.remove.isPending}
      />
    </div>
  );
};

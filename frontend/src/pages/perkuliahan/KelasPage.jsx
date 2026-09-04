import { Settings2 } from 'lucide-react';
import { IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/common/DataTable';

export const KelasPage = () => {
  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'nama', header: 'Kelas', sortable: true, cellClassName: 'font-semibold' },
    {
      key: 'matakuliah_id',
      header: 'Nama Mata Kuliah',
      sortable: true,
      render: (row) => row.matakuliah?.nama_resmi || '—',
    },
    {
      key: 'sks',
      header: 'SKS',
      render: (row) => row.matakuliah?.jumlah_sks_kurikulum,
    },
    {
      key: 'semester_prodi_id',
      header: 'Semester Prodi',
      render: (row) => row.semesterProdi?.id || '—',
    },
    {
      key: 'jumlah_peserta_max',
      header: 'Kuota',
      sortable: true,
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <IconLink
          label="Kelola kelas"
          icon={Settings2}
          tone="text-info"
          tooltipPosition="tooltip-left"
          to={`/perkuliahan/kelas/${row.id}`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Kelas"
        subtitle="Kelola daftar kelas perkuliahan per semester"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Kelas' }]}
      />
      <Card title="Daftar Kelas">
        <DataTable
          resource="kelas"
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari kelas atau mata kuliah..."
        />
      </Card>
    </div>
  );
};

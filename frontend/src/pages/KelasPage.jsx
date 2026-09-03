import { Settings2 } from 'lucide-react';
import { IconLink } from '../components/common/IconButton';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { DataTable } from '../components/common/DataTable';
import { FILTER_SEMESTER } from '../constants/mockData';

export const KelasPage = () => {
  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kode', header: 'Kelas', sortable: true, cellClassName: 'font-semibold' },
    { key: 'mataKuliah', header: 'Nama Mata Kuliah', sortable: true },
    { key: 'sks', header: 'SKS', sortable: true },
    {
      key: 'prodi',
      header: 'Prodi',
      sortable: true,
      filter: { type: 'select', options: ['S1', 'S2', 'S3'] },
      render: (row) => (
        <div>
          <div className="text-sm">{row.prodi}</div>
          <div className="text-xs text-base-content/50">JURUSAN TEKNIK MESIN</div>
        </div>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      sortable: true,
      filter: { type: 'select', options: FILTER_SEMESTER },
    },
    { key: 'peserta', header: 'Jumlah Peserta', sortable: true },
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
          to={`/perkuliahan/kelas/${encodeURIComponent(row.kode)}`}
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
          rowKey={(r) => r.kode}
          searchPlaceholder="Cari kelas, mata kuliah, atau dosen..."
        />
      </Card>
    </div>
  );
};

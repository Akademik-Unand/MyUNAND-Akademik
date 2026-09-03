import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { useMockQuery } from '../hooks/useMockQuery';
import { KELAS, FILTER_SEMESTER } from '../constants/mockData';

const filterFields = [
  { label: 'Semester', placeholder: 'Pilih Semester', options: FILTER_SEMESTER.map((s) => ({ value: s, label: s })) },
];

export const KelasPage = () => {
  const { data, isLoading } = useMockQuery(KELAS);

  if (isLoading) return <PageSkeleton tableCols={8} />;

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kode', header: 'Kelas', cellClassName: 'font-semibold' },
    { key: 'mataKuliah', header: 'Nama Mata Kuliah' },
    { key: 'sks', header: 'SKS' },
    {
      key: 'prodi',
      header: 'Prodi',
      render: (row) => (
        <div>
          <div className="text-sm">{row.prodi}</div>
          <div className="text-xs text-base-content/50">JURUSAN TEKNIK MESIN</div>
        </div>
      ),
    },
    { key: 'semester', header: 'Semester' },
    { key: 'peserta', header: 'Jumlah Peserta' },
    {
      header: 'Action',
      render: (row) => (
        <Link to={`/perkuliahan/kelas/${encodeURIComponent(row.kode)}`} className="btn btn-info btn-xs gap-1">
          <Settings2 size={13} /> Kelola
        </Link>
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
      <Card title="Filter">
        <FilterBar fields={filterFields} />
      </Card>
      <Card title="Daftar Kelas">
        <DataTable columns={columns} data={data} rowKey={(r) => r.kode} />
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { MappingMatrix } from '../components/common/MappingMatrix';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { useMockQuery } from '../hooks/useMockQuery';
import {
  MK_SEMESTER,
  FILTER_DEPARTEMEN,
  FILTER_PRODI,
  FILTER_KURIKULUM,
  FILTER_SEMESTER,
  MAPPING_MATRIX,
  MK_TRANSKRIP,
} from '../constants/mockData';

const filterFields = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
  { label: 'Semester', placeholder: 'Pilih Semester', options: FILTER_SEMESTER.map((s) => ({ value: s, label: s })) },
];

const checkboxes = [
  'Hanya yang belum ada CPMK Semester',
  'Hanya yang Anda ampu',
  'CPMK Semester Belum Disetujui',
  'Sudah Upload Dokumen',
];

export const MKSemesterPage = () => {
  const { data, isLoading } = useMockQuery(MK_SEMESTER);
  const [tab, setTab] = useState('mk');

  if (isLoading) return <PageSkeleton tableCols={9} />;

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kode', header: 'Kode', cellClassName: 'font-semibold' },
    { key: 'nama', header: 'Nama Mata Kuliah' },
    { key: 'sks', header: 'SKS' },
    { key: 'kelas', header: 'Jumlah Kelas' },
    { key: 'peserta', header: 'Jumlah Peserta' },
    {
      key: 'transkrip',
      header: 'Transkrip',
      render: (row) =>
        row.transkrip === 'Ya' ? (
          <span className="badge badge-success badge-sm">Ya</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Tidak</span>
        ),
    },
    {
      header: 'Dokumen Evaluasi',
      render: () => <button type="button" className="btn btn-xs btn-ghost">Tidak ada</button>,
    },
    {
      key: 'jumlahCpmk',
      header: 'Jumlah CPMK',
      render: (row) => (
        <Link to={`/perkuliahan/mk-semester/${encodeURIComponent(row.kode)}`} className="badge badge-info text-info-content">
          {row.jumlahCpmk} CPMK
        </Link>
      ),
    },
  ];

  const transkripColumns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kode', header: 'Kode' },
    { key: 'nama', header: 'Nama Mata Kuliah' },
    { key: 'sks', header: 'SKS' },
    { key: 'semester', header: 'Semester Kurikulum' },
    {
      key: 'wajib',
      header: 'Wajib',
      render: (row) => (row.wajib ? <span className="badge badge-success badge-sm">Ya</span> : 'Tidak'),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola MK Semester"
        subtitle="Kelola mata kuliah per semester dan evaluasi capaian pembelajaran"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'MK Semester' }]}
      />

      <Card>
        <FilterBar fields={filterFields} />
        <div className="divider my-3"></div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/70">
          <span className="font-medium">Filter:</span>
          {checkboxes.map((c) => (
            <label key={c} className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" />
              {c}
            </label>
          ))}
        </div>
      </Card>

      <div className="tabs tabs-boxed bg-base-200 w-fit">
        <button type="button" className={`tab ${tab === 'mk' ? 'tab-active' : ''}`} onClick={() => setTab('mk')}>
          MK Semester
        </button>
        <button type="button" className={`tab ${tab === 'mapping' ? 'tab-active' : ''}`} onClick={() => setTab('mapping')}>
          Mapping CP
        </button>
        <button type="button" className={`tab ${tab === 'transkrip' ? 'tab-active' : ''}`} onClick={() => setTab('transkrip')}>
          MK Transkrip
        </button>
      </div>

      {tab === 'mk' && (
        <Card title="Daftar MK Semester">
          <DataTable columns={columns} data={data} rowKey={(r) => r.kode} />
        </Card>
      )}
      {tab === 'mapping' && (
        <Card title="Mapping CP">
          <MappingMatrix matrix={MAPPING_MATRIX} />
        </Card>
      )}
      {tab === 'transkrip' && (
        <Card title="MK Transkrip CP">
          <DataTable columns={transkripColumns} data={MK_TRANSKRIP} rowKey={(r) => r.kode} />
        </Card>
      )}
    </div>
  );
};

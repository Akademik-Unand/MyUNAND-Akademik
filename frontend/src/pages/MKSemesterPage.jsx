import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { IconLink } from '../components/common/IconButton';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { MappingMatrix } from '../components/common/MappingMatrix';
import {
  FILTER_DEPARTEMEN,
  FILTER_PRODI,
  FILTER_KURIKULUM,
  FILTER_SEMESTER,
  MAPPING_MATRIX,
} from '../constants/mockData';

const filterFields = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
  { label: 'Semester', placeholder: 'Pilih Semester', options: FILTER_SEMESTER.map((s) => ({ value: s, label: s })) },
];

const mkCheckboxes = [
  'Hanya yang belum ada CPMK Semester',
  'Hanya yang Anda ampu',
  'CPMK Semester Belum Disetujui',
  'Sudah Upload Dokumen',
];

const transkripCheckboxes = [
  'Hanya yang belum ada CPMK Semester',
  'Hanya yang Anda ampu',
  'CPMK Semester Belum Disetujui',
  'Belum Upload Dokumen',
];

export const MKSemesterPage = () => {
  const [tab, setTab] = useState('mk');

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kode', header: 'Kode', sortable: true, cellClassName: 'font-semibold' },
    { key: 'nama', header: 'Nama Mata Kuliah', sortable: true },
    { key: 'sks', header: 'SKS', sortable: true },
    { key: 'kelas', header: 'Jumlah Kelas', sortable: true },
    { key: 'peserta', header: 'Jumlah Peserta', sortable: true },
    {
      key: 'transkrip',
      header: 'Transkrip',
      sortable: true,
      filter: { type: 'select', options: ['Ya', 'Tidak'] },
      render: (row) =>
        row.transkrip === 'Ya' ? (
          <span className="badge badge-success badge-sm">Ya</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Tidak</span>
        ),
    },
    {
      header: 'Dokumen Evaluasi',
      render: (row) => (
        <Link
          to={`/perkuliahan/mk-semester/${encodeURIComponent(row.kode)}/dokumen`}
          className="btn btn-xs btn-ghost"
        >
          Tidak ada
        </Link>
      ),
    },
    {
      key: 'jumlahCpmk',
      header: 'Jumlah CPMK',
      sortable: true,
      render: (row) => (
        <Link
          to={`/perkuliahan/mk-semester/${encodeURIComponent(row.kode)}`}
          className="badge badge-info text-info-content"
        >
          {row.jumlahCpmk} CPMK
        </Link>
      ),
    },
  ];

  const transkripColumns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kode', header: 'Kode', sortable: true, cellClassName: 'font-semibold' },
    { key: 'nama', header: 'Nama Mata Kuliah', sortable: true },
    { key: 'sks', header: 'SKS', sortable: true },
    { key: 'kelas', header: 'Jumlah Kelas', sortable: true },
    { key: 'peserta', header: 'Jumlah Peserta', sortable: true },
    { key: 'jumlahCpmk', header: 'Jumlah CPMK', sortable: true },
    {
      key: 'transkrip',
      header: 'Transkrip',
      sortable: true,
      filter: { type: 'select', options: ['Ya', 'Tidak'] },
      render: (row) =>
        row.transkrip === 'Ya' ? (
          <span className="badge badge-success badge-sm">Ya</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Tidak</span>
        ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <IconLink
          label="Kelola MK"
          icon={Settings2}
          tone="text-info"
          tooltipPosition="tooltip-left"
          to={`/perkuliahan/mk-semester/${encodeURIComponent(row.kode)}`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola MK Semester"
        subtitle="Kelola mata kuliah per semester dan evaluasi capaian pembelajaran"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'MK Semester' }]}
        action={
          tab === 'transkrip' ? (
            <Link to="/perkuliahan/mk-semester/transkrip/atur">
              <Button size="sm">Atur</Button>
            </Link>
          ) : null
        }
      />

      <Card>
        <FilterBar fields={filterFields} />
        <div className="divider my-3"></div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-base-content/70">
          <span className="font-medium">Filter:</span>
          {(tab === 'transkrip' ? transkripCheckboxes : mkCheckboxes).map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" />
              {item}
            </label>
          ))}
        </div>
      </Card>

      <div className="tabs tabs-box w-fit bg-base-200">
        <button type="button" className={`tab ${tab === 'mk' ? 'tab-active' : ''}`} onClick={() => setTab('mk')}>
          MK Semester
        </button>
        <button type="button" className={`tab ${tab === 'mapping' ? 'tab-active' : ''}`} onClick={() => setTab('mapping')}>
          Mapping CP
        </button>
        <button
          type="button"
          className={`tab ${tab === 'transkrip' ? 'tab-active' : ''}`}
          onClick={() => setTab('transkrip')}
        >
          MK Transkrip
        </button>
      </div>

      {tab === 'mk' && (
        <Card title="Daftar MK Semester">
          <DataTable
            resource="mk-semester"
            tableKey="mk_"
            columns={columns}
            rowKey={(row) => row.kode}
            searchPlaceholder="Cari kode atau nama mata kuliah..."
          />
        </Card>
      )}
      {tab === 'mapping' && (
        <Card
          title="Mapping CP"
          actions={<span className="badge badge-ghost">Total Matakuliah: {MAPPING_MATRIX.rows.length}</span>}
        >
          <MappingMatrix matrix={MAPPING_MATRIX} />
        </Card>
      )}
      {tab === 'transkrip' && (
        <Card title="MK Transkrip CP">
          <DataTable
            resource="mk-transkrip"
            tableKey="tr_"
            columns={transkripColumns}
            rowKey={(row) => row.kode}
            searchPlaceholder="Cari mata kuliah transkrip..."
          />
        </Card>
      )}
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { Drawer } from '../components/ui/Drawer';
import { DetailList } from '../components/common/DetailList';
import { useMockQuery } from '../hooks/useMockQuery';
import {
  UPLOAD_NILAI,
  UPLOAD_HISTORY,
  FILTER_DEPARTEMEN,
  FILTER_PRODI,
  FILTER_KURIKULUM,
  FILTER_SEMESTER,
} from '../constants/mockData';

const filterFields = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
  { label: 'Semester', placeholder: 'Pilih Semester', options: FILTER_SEMESTER.map((s) => ({ value: s, label: s })) },
];

export const UploadNilaiPage = () => {
  const { data, isLoading } = useMockQuery(UPLOAD_NILAI);
  const [tab, setTab] = useState('kelas');
  const [historyItem, setHistoryItem] = useState(null);

  if (isLoading) return <PageSkeleton tableCols={8} />;

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kelas', header: 'Kelas', cellClassName: 'font-semibold' },
    { key: 'mataKuliah', header: 'Mata Kuliah' },
    { key: 'sks', header: 'SKS' },
    { key: 'prodi', header: 'Prodi' },
    { key: 'semester', header: 'Semester' },
    { key: 'peserta', header: 'Jumlah Peserta' },
    {
      header: 'Action',
      render: (row) => (
        <Link to={`/perkuliahan/upload-nilai/${encodeURIComponent(row.kelas)}`} className="btn btn-success btn-xs">
          Kelola
        </Link>
      ),
    },
  ];

  const historyColumns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kelas', header: 'Kelas' },
    { key: 'mataKuliah', header: 'Mata Kuliah' },
    { key: 'pengunggah', header: 'Pengunggah' },
    { key: 'waktu', header: 'Waktu' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`badge badge-sm ${row.status === 'Berhasil' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span>
      ),
    },
    {
      header: 'Aksi',
      render: (row) => (
        <button type="button" className="btn btn-ghost btn-xs" onClick={() => setHistoryItem(row)}>
          Detail
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Nilai"
        subtitle="Unggah dan kelola nilai perkuliahan per kelas"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Upload Nilai' }]}
      />
      <Card title="Filter">
        <FilterBar fields={filterFields} />
      </Card>
      <div className="tabs tabs-boxed bg-base-200 w-fit">
        <button type="button" className={`tab ${tab === 'kelas' ? 'tab-active' : ''}`} onClick={() => setTab('kelas')}>
          Daftar Kelas
        </button>
        <button type="button" className={`tab ${tab === 'history' ? 'tab-active' : ''}`} onClick={() => setTab('history')}>
          History Upload Nilai
        </button>
      </div>
      {tab === 'kelas' ? (
        <Card title="Daftar Kelas">
          <DataTable columns={columns} data={data} rowKey={(r) => r.kelas} />
        </Card>
      ) : (
        <Card title="History Upload Nilai">
          <DataTable columns={historyColumns} data={UPLOAD_HISTORY} rowKey={(r) => r.id} />
        </Card>
      )}
      <Drawer
        open={Boolean(historyItem)}
        onClose={() => setHistoryItem(null)}
        title="Detail Upload"
        subtitle={historyItem?.kelas}
      >
        {historyItem && (
          <DetailList
            items={[
              { label: 'Kelas', value: historyItem.kelas },
              { label: 'Mata kuliah', value: historyItem.mataKuliah },
              { label: 'Pengunggah', value: historyItem.pengunggah },
              { label: 'Waktu', value: historyItem.waktu },
              { label: 'Status', value: historyItem.status },
              { label: 'Peserta', value: historyItem.peserta },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

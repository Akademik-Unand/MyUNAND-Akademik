import { useState } from 'react';
import { Eye, Settings2 } from 'lucide-react';
import { IconButton, IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import {
  FILTER_DEPARTEMEN,
  FILTER_PRODI,
  FILTER_KURIKULUM,
  FILTER_SEMESTER,
} from '../../constants/mockData';

const filterFields = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
  { label: 'Semester', placeholder: 'Pilih Semester', options: FILTER_SEMESTER.map((s) => ({ value: s, label: s })) },
];

export const UploadNilaiPage = () => {
  const [tab, setTab] = useState('kelas');
  const [historyItem, setHistoryItem] = useState(null);

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kelas', header: 'Kelas', sortable: true, cellClassName: 'font-semibold' },
    { key: 'mataKuliah', header: 'Mata Kuliah', sortable: true },
    { key: 'sks', header: 'SKS', sortable: true },
    {
      key: 'prodi',
      header: 'Prodi',
      sortable: true,
      filter: { type: 'select', options: FILTER_PRODI },
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
          label="Kelola nilai"
          icon={Settings2}
          tone="text-success"
          tooltipPosition="tooltip-left"
          to={`/perkuliahan/upload-nilai/${encodeURIComponent(row.kelas)}`}
        />
      ),
    },
  ];

  const historyColumns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kelas', header: 'Kelas', sortable: true },
    { key: 'mataKuliah', header: 'Mata Kuliah', sortable: true },
    { key: 'pengunggah', header: 'Pengunggah', sortable: true },
    { key: 'waktu', header: 'Waktu', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filter: { type: 'select', options: ['Berhasil', 'Diproses', 'Gagal'] },
      render: (row) => (
        <span className={`badge badge-sm ${row.status === 'Berhasil' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <IconButton
          label="Lihat detail"
          icon={Eye}
          tone="text-info"
          tooltipPosition="tooltip-left"
          onClick={() => setHistoryItem(row)}
        />
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
      <div className="tabs tabs-box bg-base-200 w-fit">
        <button type="button" className={`tab ${tab === 'kelas' ? 'tab-active' : ''}`} onClick={() => setTab('kelas')}>
          Daftar Kelas
        </button>
        <button type="button" className={`tab ${tab === 'history' ? 'tab-active' : ''}`} onClick={() => setTab('history')}>
          History Upload Nilai
        </button>
      </div>
      {tab === 'kelas' ? (
        <Card title="Daftar Kelas">
          <DataTable
            resource="upload-nilai"
            paramPrefix="kelas_"
            columns={columns}
            rowKey={(r) => r.kelas}
            searchPlaceholder="Cari kelas atau mata kuliah..."
          />
        </Card>
      ) : (
        <Card title="History Upload Nilai">
          <DataTable
            resource="upload-history"
            paramPrefix="history_"
            columns={historyColumns}
            rowKey={(r) => r.id}
            searchPlaceholder="Cari kelas atau pengunggah..."
          />
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

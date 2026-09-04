import { useState } from 'react';
import { Eye, Settings2 } from 'lucide-react';
import { IconButton, IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export const UploadNilaiPage = () => {
  const [tab, setTab] = useState('kelas');
  const [historyItem, setHistoryItem] = useState(null);
  const filters = useFilterOptions();

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'nama', header: 'Kelas', sortable: true, cellClassName: 'font-semibold' },
    {
      key: 'matakuliah_id',
      header: 'Mata Kuliah',
      sortable: true,
      render: (row) => row.matakuliah?.nama_resmi || '—',
    },
    {
      key: 'sks',
      header: 'SKS',
      render: (row) => row.matakuliah?.jumlah_sks_kurikulum,
    },
    { key: 'jumlah_peserta_max', header: 'Kuota', sortable: true },
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
          to={`/perkuliahan/upload-nilai/${row.id}`}
        />
      ),
    },
  ];

  const historyColumns = [
    { header: '#', render: (_, idx) => idx + 1 },
    {
      key: 'kelas_id',
      header: 'Kelas',
      render: (row) => row.kelas?.nama || '—',
    },
    {
      key: 'mataKuliah',
      header: 'Mata Kuliah',
      render: (row) => row.kelas?.matakuliah?.nama_resmi || '—',
    },
    {
      key: 'user_id',
      header: 'Pengunggah',
      render: (row) => row.user?.name || '—',
    },
    { key: 'createdAt', header: 'Waktu', sortable: true },
    { key: 'file_name', header: 'Berkas', sortable: true },
    { key: 'tipe', header: 'Tipe', sortable: true },
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
        <FilterBar
          fields={[
            { label: 'Departemen', placeholder: 'Pilih Departemen', options: filters.departemen },
            { label: 'Prodi', placeholder: 'Pilih', options: filters.prodi },
            { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: filters.kurikulum },
            { label: 'Semester', placeholder: 'Pilih Semester', options: filters.semester },
          ]}
        />
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
            rowKey={(row) => row.id}
            searchPlaceholder="Cari kelas atau mata kuliah..."
          />
        </Card>
      ) : (
        <Card title="History Upload Nilai">
          <DataTable
            resource="upload-history"
            paramPrefix="history_"
            columns={historyColumns}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari kelas atau pengunggah..."
          />
        </Card>
      )}
      <Drawer
        open={Boolean(historyItem)}
        onClose={() => setHistoryItem(null)}
        title="Detail Upload"
        subtitle={historyItem?.kelas?.nama}
      >
        {historyItem && (
          <DetailList
            items={[
              { label: 'Kelas', value: historyItem.kelas?.nama },
              { label: 'Mata kuliah', value: historyItem.kelas?.matakuliah?.nama_resmi },
              { label: 'Pengunggah', value: historyItem.user?.name },
              { label: 'Waktu', value: historyItem.createdAt },
              { label: 'Berkas', value: historyItem.file_name },
              { label: 'Keterangan', value: historyItem.keterangan },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

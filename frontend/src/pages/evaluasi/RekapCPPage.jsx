import { useState } from 'react';
import { Eye } from 'lucide-react';
import { IconButton } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export const RekapCPPage = () => {
  const [detail, setDetail] = useState(null);
  const filters = useFilterOptions();

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    {
      key: 'mahasiswa_id',
      header: 'Mahasiswa',
      sortable: true,
      render: (row) => row.mahasiswa?.nama || row.mahasiswa?.nim || row.mahasiswa_id,
    },
    {
      key: 'cp_id',
      header: 'CP',
      sortable: true,
      render: (row) => row.cp?.nama_cp || row.cp_id,
    },
    { key: 'nilai_capaian', header: 'Nilai capaian', sortable: true },
    {
      key: 'status_lulus',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`badge badge-sm ${row.status_lulus ? 'badge-success' : 'badge-error'}`}>
          {row.status_lulus ? 'Lulus' : 'Belum'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      render: (row) => (
        <IconButton label="Lihat detail" icon={Eye} tone="text-info" onClick={() => setDetail(row)} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekap Nilai CP"
        subtitle="Rekapitulasi capaian pembelajaran mahasiswa"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Rekap Nilai CP' }]}
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

      <Card title="Rekap Nilai">
        <DataTable
          resource="rekap-cp"
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari mahasiswa atau CP..."
        />
      </Card>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Rekap CP" widthClass="w-full max-w-lg">
        {detail && (
          <DetailList
            items={[
              { label: 'Mahasiswa', value: detail.mahasiswa?.nama || detail.mahasiswa_id },
              { label: 'CP', value: detail.cp?.nama_cp || detail.cp_id },
              { label: 'Nilai capaian', value: detail.nilai_capaian },
              { label: 'Status', value: detail.status_lulus ? 'Lulus' : 'Belum' },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

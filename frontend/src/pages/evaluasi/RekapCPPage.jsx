import { useState } from 'react';
import { toast } from 'sonner';
import { Download, Eye } from 'lucide-react';
import { IconButton } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { Drawer } from '../../components/ui/Drawer';
import { DetailList } from '../../components/common/DetailList';
import { Select } from '../../components/ui/Select';
import { useBusyAction } from '../../hooks/useBusyAction';
import {
  FILTER_DEPARTEMEN,
  FILTER_PRODI,
  FILTER_KURIKULUM,
  FILTER_SEMESTER,
  KURIKULUM_CP,
  MK_SEMESTER,
} from '../../constants/mockData';

const topFilters = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
  { label: 'Semester', placeholder: 'Pilih Semester', options: FILTER_SEMESTER.map((s) => ({ value: s, label: s })) },
];

export const RekapCPPage = () => {
  const [detail, setDetail] = useState(null);
  const { busy: downloading, runMock: runDownload } = useBusyAction();
  const { busy: applying, runMock: runApply } = useBusyAction();

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'bp', header: 'BP', sortable: true },
    { key: 'mahasiswa', header: 'Mahasiswa', sortable: true },
    { key: 'angkatan', header: 'Angkatan', sortable: true, filter: { type: 'select', options: ['2021', '2022', '2023'] } },
    { key: 'semester', header: 'Semester', sortable: true },
    { key: 'mk', header: 'MK', sortable: true },
    { key: 'kelas', header: 'Kelas', sortable: true },
    { key: 'cpmk', header: 'CPMK', sortable: true },
    { key: 'cp', header: 'CP', sortable: true },
    { key: 'scp', header: 'SCP', sortable: true },
    { key: 'targetMin', header: 'Target Nilai Minimal', sortable: true },
    { key: 'targetCapai', header: 'Target Mencapai Nilai Minimal', sortable: true },
    { key: 'capaianTarget', header: 'Capaian', sortable: true },
    {
      key: 'statusTercapai',
      header: 'Status',
      sortable: true,
      filter: { type: 'select', options: ['Tercapai', 'Belum'] },
      render: (row) => (
        <span className={`badge badge-sm ${row.statusTercapai === 'Tercapai' ? 'badge-success' : 'badge-error'}`}>
          {row.statusTercapai}
        </span>
      ),
    },
    { key: 'nilai', header: 'Nilai' },
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
        title="Rekap Nilai CP Genap 2024"
        subtitle="Rekapitulasi capaian pembelajaran mahasiswa"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Rekap Nilai CP' }]}
        action={
          <Button
            size="sm"
            className="gap-1.5"
            isLoading={downloading}
            onClick={() =>
              runDownload(() =>
                toast.success('File Excel disiapkan (mock)', { description: 'Unduhan tidak terhubung ke API.' })
              )
            }
          >
            <Download size={14} /> Download Excel
          </Button>
        }
      />

      <Card title="Filter">
        <FilterBar fields={topFilters} />
      </Card>

      <Card title="Filter data">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          <Select
            size="sm"
            label="CP"
            placeholder="Semua CP/SCP"
            options={KURIKULUM_CP.map((cp) => ({ value: cp.kode, label: cp.kode }))}
          />
          <Select
            size="sm"
            label="MK"
            placeholder="Semua MK"
            options={MK_SEMESTER.map((mk) => ({ value: mk.kode, label: `${mk.kode} — ${mk.nama}` }))}
          />
          <Select
            size="sm"
            label="Kelas"
            placeholder="Semua Kelas"
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
              { value: 'KBI', label: 'KBI' },
            ]}
          />
          <Select
            size="sm"
            label="MK Transkrip Saja?"
            placeholder="Pilih"
            options={[
              { value: 'Tidak', label: 'Tidak' },
              { value: 'Ya', label: 'Ya' },
            ]}
            defaultValue="Tidak"
          />
          <Select
            size="sm"
            label="Pilihan Data"
            options={[{ value: 'persen', label: 'Persen Mencapai Target' }]}
            defaultValue="persen"
          />
          <Select
            size="sm"
            label="Angkatan"
            placeholder="Semua Angkatan"
            options={['2021', '2022', '2023', '2024'].map((year) => ({ value: year, label: year }))}
          />
        </div>
        <Button
          size="sm"
          isLoading={applying}
          onClick={() => runApply(() => toast.info('Filter diterapkan', { description: 'Data mock tidak berubah.' }))}
        >
          Apply Filter
        </Button>
      </Card>

      <Card title="Rekap Nilai">
        <DataTable
          resource="rekap-cp"
          columns={columns}
          rowKey={(r) => r.id}
          searchPlaceholder="Cari mahasiswa, MK, atau CP..."
        />
      </Card>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Rekap CP" subtitle={detail?.mahasiswa} widthClass="w-full max-w-lg">
        {detail && (
          <DetailList
            items={[
              { label: 'BP', value: detail.bp },
              { label: 'Mahasiswa', value: detail.mahasiswa },
              { label: 'Angkatan', value: detail.angkatan },
              { label: 'Semester', value: detail.semester },
              { label: 'MK', value: detail.mk },
              { label: 'Kelas', value: detail.kelas },
              { label: 'CPMK', value: detail.cpmk },
              { label: 'CP / SCP', value: `${detail.cp} / ${detail.scp}` },
              { label: 'Target min', value: detail.targetMin },
              { label: 'Target capai', value: detail.targetCapai },
              { label: 'Capaian', value: detail.capaianTarget },
              { label: 'Status', value: detail.statusTercapai },
              { label: 'Sumber', value: detail.sumber },
              { label: 'Bobot', value: detail.bobot },
              { label: 'Nilai', value: detail.nilai },
              { label: 'Lulus', value: detail.lulus },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

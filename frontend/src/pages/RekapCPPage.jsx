import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { Drawer } from '../components/ui/Drawer';
import { DetailList } from '../components/common/DetailList';
import { useMockQuery } from '../hooks/useMockQuery';
import {
  REKAP_CP_ROWS,
  FILTER_DEPARTEMEN,
  FILTER_PRODI,
  FILTER_KURIKULUM,
  FILTER_SEMESTER,
} from '../constants/mockData';

const topFilters = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
  { label: 'Semester', placeholder: 'Pilih Semester', options: FILTER_SEMESTER.map((s) => ({ value: s, label: s })) },
];

export const RekapCPPage = () => {
  const { data, isLoading } = useMockQuery(REKAP_CP_ROWS);
  const [detail, setDetail] = useState(null);

  if (isLoading) return <PageSkeleton tableCols={10} />;

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'bp', header: 'BP' },
    { key: 'mahasiswa', header: 'Mahasiswa' },
    { key: 'angkatan', header: 'Angkatan' },
    { key: 'mk', header: 'MK' },
    { key: 'cpmk', header: 'CPMK' },
    { key: 'cp', header: 'CP' },
    { key: 'scp', header: 'SCP' },
    { key: 'targetMin', header: 'Nilai Min' },
    { key: 'capaianTarget', header: 'Capaian' },
    {
      key: 'statusTercapai',
      header: 'Status',
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
        <button type="button" className="btn btn-ghost btn-xs" onClick={() => setDetail(row)}>
          Detail
        </button>
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
            onClick={() => toast.success('File Excel disiapkan (mock)', { description: 'Unduhan tidak terhubung ke API.' })}
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
          <label className="form-control">
            <span className="label-text text-xs">CP</span>
            <select className="select select-bordered select-sm"><option>-- Semua CP/SCP --</option></select>
          </label>
          <label className="form-control">
            <span className="label-text text-xs">MK</span>
            <select className="select select-bordered select-sm"><option>-- Semua MK --</option></select>
          </label>
          <label className="form-control">
            <span className="label-text text-xs">Kelas</span>
            <select className="select select-bordered select-sm">
              <option>-- Semua Kelas --</option>
              <option>A</option>
              <option>B</option>
            </select>
          </label>
          <label className="form-control">
            <span className="label-text text-xs">MK Transkrip Saja?</span>
            <select className="select select-bordered select-sm">
              <option>Tidak</option>
              <option>Ya</option>
            </select>
          </label>
          <label className="form-control">
            <span className="label-text text-xs">Pilihan Data</span>
            <select className="select select-bordered select-sm">
              <option>Persen Mencapai Target</option>
            </select>
          </label>
          <label className="form-control">
            <span className="label-text text-xs">Angkatan</span>
            <select className="select select-bordered select-sm">
              <option>-- Semua Angkatan --</option>
              <option>2021</option>
              <option>2022</option>
              <option>2023</option>
            </select>
          </label>
        </div>
        <Button size="sm" onClick={() => toast.info('Filter diterapkan', { description: 'Data mock tidak berubah.' })}>
          Apply Filter
        </Button>
      </Card>

      <Card title="Rekap Nilai">
        <DataTable columns={columns} data={data} rowKey={(r) => r.id} />
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

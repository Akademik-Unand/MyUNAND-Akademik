import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { MappingMatrix } from '../../components/common/MappingMatrix';
import { FILTER_DEPARTEMEN, FILTER_PRODI, FILTER_KURIKULUM, MAPPING_MATRIX } from '../../constants/mockData';

const filterFields = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
];

export const CPMKKurikulumPage = () => {
  const [tab, setTab] = useState('cpmk');

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kode', header: 'Kode', sortable: true, cellClassName: 'font-semibold' },
    { key: 'sks', header: 'SKS', sortable: true },
    { key: 'nama', header: 'Nama Mata Kuliah', sortable: true },
    {
      key: 'jumlahCpmk',
      header: 'Jumlah CPMK',
      sortable: true,
      render: (row) => <span className="badge badge-info badge-sm">{row.jumlahCpmk} CPMK</span>,
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <IconLink
          label="Atur CPMK"
          icon={Settings2}
          tone="text-info"
          tooltipPosition="tooltip-left"
          to={`/kurikulum/cpmk/${encodeURIComponent(row.kode)}`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola CPMK"
        subtitle="Kelola capaian pembelajaran mata kuliah (CPMK) pada kurikulum"
        breadcrumbs={[{ label: 'Kurikulum' }, { label: 'CPMK Kurikulum' }]}
      />

      <Card>
        <FilterBar fields={filterFields} />
        <div className="divider my-3"></div>
        <div className="tabs tabs-box bg-base-200 w-fit">
          <button type="button" className={`tab tab-sm ${tab === 'cpmk' ? 'tab-active' : ''}`} onClick={() => setTab('cpmk')}>
            CPMK Kurikulum
          </button>
          <button type="button" className={`tab tab-sm ${tab === 'mapping' ? 'tab-active' : ''}`} onClick={() => setTab('mapping')}>
            Mapping
          </button>
        </div>

        {tab === 'cpmk' ? (
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-base-content/70">
              <span className="font-medium">Filter:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" />
                Hanya yang belum ada CPMK
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-xs checkbox-primary" />
                Hanya yang Anda ampu
              </label>
            </div>
            <DataTable
              resource="cpmk-kurikulum"
              columns={columns}
              rowKey={(r) => r.kode}
              searchPlaceholder="Cari kode atau nama mata kuliah..."
            />
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-xs text-base-content/70 mb-3">
              <span className="badge badge-ghost">Cuplikan matriks mapping CP</span>
            </p>
            <MappingMatrix matrix={MAPPING_MATRIX} />
          </div>
        )}
      </Card>
    </div>
  );
};

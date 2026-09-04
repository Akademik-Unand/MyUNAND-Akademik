import { Settings2 } from 'lucide-react';
import { IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export const CPMKKurikulumPage = () => {
  const filters = useFilterOptions();

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'kode_matakuliah', header: 'Kode', sortable: true, cellClassName: 'font-semibold' },
    { key: 'jumlah_sks_kurikulum', header: 'SKS', sortable: true },
    { key: 'nama_resmi', header: 'Nama Mata Kuliah', sortable: true },
    {
      key: 'cpmk',
      header: 'Jumlah CPMK',
      render: (row) => <span className="badge badge-info badge-sm">{row.cpmk?.length || 0} CPMK</span>,
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
          to={`/kurikulum/cpmk/${row.id}`}
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
        <FilterBar
          fields={[
            { label: 'Departemen', placeholder: 'Pilih Departemen', options: filters.departemen },
            { label: 'Prodi', placeholder: 'Pilih', options: filters.prodi },
            { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: filters.kurikulum },
          ]}
        />
        <div className="divider my-3"></div>
        <DataTable
          resource="matakuliah"
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari kode atau nama mata kuliah..."
        />
      </Card>
    </div>
  );
};

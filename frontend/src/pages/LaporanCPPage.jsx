import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FilterBar } from '../components/common/FilterBar';
import { DataTable } from '../components/common/DataTable';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { useMockQuery } from '../hooks/useMockQuery';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { LAPORAN_CP, FILTER_DEPARTEMEN, FILTER_PRODI } from '../constants/mockData';

const filterFields = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
];

export const LaporanCPPage = () => {
  const { data, isLoading, setData } = useMockQuery(LAPORAN_CP);
  const del = useConfirmDelete();

  if (isLoading) return <PageSkeleton tableCols={6} />;

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    {
      header: 'Nama Laporan',
      render: (row) => (
        <div>
          <div className="font-medium">{row.nama}</div>
          <div className="text-xs text-base-content/50">Last Edited: {row.terakhir}</div>
        </div>
      ),
    },
    { key: 'keterangan', header: 'Keterangan' },
    { key: 'dibuatOleh', header: 'Dibuat Oleh' },
    {
      header: 'Lihat',
      render: (row) => (
        <Link to={`/perkuliahan/laporan-cp/${row.id}`} className="btn btn-outline btn-success btn-xs">
          Lihat
        </Link>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link to={`/perkuliahan/laporan-cp/${row.id}/edit`} className="btn btn-outline btn-primary btn-xs">
            Edit
          </Link>
          <button type="button" className="btn btn-outline btn-error btn-xs" onClick={() => del.askDelete(row)}>
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan CP"
        subtitle="Kumpulkan dan tinjau laporan capaian pembelajaran"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Laporan CP' }]}
        action={
          <Link to="/perkuliahan/laporan-cp/baru">
            <Button size="sm" className="gap-1.5">
              <Plus size={15} /> Tambah Laporan CP
            </Button>
          </Link>
        }
      />
      <Card title="Filter">
        <FilterBar fields={filterFields} />
      </Card>
      <Card title="Daftar Laporan">
        <DataTable columns={columns} data={data} rowKey={(r) => r.id} />
      </Card>
      <ConfirmDeleteModal
        open={del.isOpen}
        onClose={del.close}
        onConfirm={() => del.confirm((item) => setData((prev) => prev.filter((r) => r.id !== item.id)))}
      />
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/common/DataTable';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { Drawer } from '../components/ui/Drawer';
import { DetailList } from '../components/common/DetailList';
import { useMockQuery } from '../hooks/useMockQuery';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { PRODI } from '../constants/mockData';

export const ProdiPage = () => {
  const { data, isLoading, setData } = useMockQuery(PRODI);
  const del = useConfirmDelete();
  const [detail, setDetail] = useState(null);

  if (isLoading) return <PageSkeleton showFilter={false} tableCols={8} />;

  const columns = [
    { key: 'kode', header: 'Kode Prodi' },
    { key: 'jenjang', header: 'Jenjang' },
    { key: 'univ', header: 'Universitas ID' },
    { key: 'fakultas', header: 'Fakultas ID' },
    { key: 'departemen', header: 'Departemen ID' },
    { key: 'nama', header: 'Nama Resmi' },
    { key: 'singkat', header: 'Nama Singkat' },
    {
      header: 'Aksi',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center gap-1 justify-end">
          <button type="button" className="btn btn-xs btn-ghost text-info" onClick={() => setDetail(row)}>
            Detail
          </button>
          <Link to={`/master/prodi/${encodeURIComponent(row.kode)}/edit`} className="btn btn-xs btn-ghost text-warning">
            Edit
          </Link>
          <button type="button" className="btn btn-xs btn-ghost text-error" onClick={() => del.askDelete(row)}>
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Studi"
        subtitle="Kelola data program studi pada SIAKAD Kurikulum"
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Program Studi' }]}
        action={
          <Link to="/master/prodi/baru">
            <Button size="sm" className="gap-1.5 font-semibold">
              <Plus size={15} /> Tambahkan Data
            </Button>
          </Link>
        }
      />

      <Card title="Daftar Program Studi">
        <DataTable columns={columns} data={data} rowKey={(r) => r.kode} />
      </Card>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Program Studi" subtitle={detail?.kode}>
        {detail && (
          <DetailList
            items={[
              { label: 'Kode', value: detail.kode },
              { label: 'Jenjang', value: detail.jenjang },
              { label: 'Model ID', value: detail.model },
              { label: 'Universitas ID', value: detail.univ },
              { label: 'Fakultas ID', value: detail.fakultas },
              { label: 'Departemen ID', value: detail.departemen },
              { label: 'Nama resmi', value: detail.nama },
              { label: 'Nama singkat', value: detail.singkat },
            ]}
          />
        )}
      </Drawer>

      <ConfirmDeleteModal
        open={del.isOpen}
        onClose={del.close}
        onConfirm={() => del.confirm((item) => setData((prev) => prev.filter((r) => r.kode !== item.kode)))}
      />
    </div>
  );
};

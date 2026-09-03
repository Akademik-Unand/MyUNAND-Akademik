import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Power } from 'lucide-react';
import { toast } from 'sonner';
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
import { SETTING_SEMESTER } from '../constants/mockData';

export const SettingSemesterPage = () => {
  const { data, isLoading, setData } = useMockQuery(SETTING_SEMESTER);
  const del = useConfirmDelete();
  const [detail, setDetail] = useState(null);

  const activate = (row) => {
    setData((prev) =>
      prev.map((r) => ({
        ...r,
        status: r.id === row.id ? 'Aktif' : 'Tidak Aktif',
      }))
    );
    toast.success(`${row.semester} ${row.tahun} diaktifkan`);
  };

  if (isLoading) return <PageSkeleton showFilter={false} tableCols={5} />;

  const columns = [
    { header: 'No', render: (_, idx) => idx + 1 },
    { key: 'tahun', header: 'Tahun Ajaran' },
    { key: 'semester', header: 'Semester' },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.status === 'Aktif' ? (
          <span className="badge badge-success badge-sm">Aktif</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Tidak Aktif</span>
        ),
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button type="button" className="btn btn-xs btn-ghost text-info" onClick={() => setDetail(row)}>
            Detail
          </button>
          {row.status !== 'Aktif' && (
            <button type="button" className="btn btn-xs btn-success btn-outline gap-1" onClick={() => activate(row)}>
              <Power size={13} /> Aktifkan
            </button>
          )}
          <Link to={`/master/semester/setting/${row.id}/edit`} className="btn btn-xs btn-ghost text-warning">
            Ubah
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
        title="Setting Semester"
        subtitle="Kelola semester aktif pada SIAKAD Kurikulum"
        breadcrumbs={[{ label: 'Master Data' }, { label: 'Semester' }, { label: 'Setting Semester' }]}
        action={
          <Link to="/master/semester/setting/baru">
            <Button size="sm" className="gap-1.5 font-semibold">
              <Plus size={15} /> Tambahkan Data
            </Button>
          </Link>
        }
      />

      <Card title="Daftar Setting Semester">
        <DataTable columns={columns} data={data} rowKey={(r) => r.id} />
      </Card>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Setting Semester" subtitle={detail ? `${detail.semester} ${detail.tahun}` : ''}>
        {detail && (
          <DetailList
            items={[
              { label: 'Tahun ajaran', value: detail.tahun },
              { label: 'Semester', value: detail.semester },
              { label: 'Status', value: detail.status },
              { label: 'Periode', value: `${detail.periodeMulai} — ${detail.periodeSelesai}` },
              { label: 'Rencana studi', value: `${detail.rencanaMulai} — ${detail.rencanaSelesai}` },
              { label: 'Ubah KRS', value: `${detail.ubahMulai} — ${detail.ubahSelesai}` },
              { label: 'Input nilai', value: `${detail.nilaiMulai} — ${detail.nilaiSelesai}` },
            ]}
          />
        )}
      </Drawer>

      <ConfirmDeleteModal
        open={del.isOpen}
        onClose={del.close}
        onConfirm={() => del.confirm((item) => setData((prev) => prev.filter((r) => r.id !== item.id)))}
      />
    </div>
  );
};

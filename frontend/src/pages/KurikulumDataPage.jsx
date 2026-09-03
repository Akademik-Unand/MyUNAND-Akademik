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
import { KURIKULUM_LIST, PROGRAM_STUDI_OPTIONS } from '../constants/mockData';

export const KurikulumDataPage = () => {
  const { data, isLoading, setData } = useMockQuery(KURIKULUM_LIST);
  const del = useConfirmDelete();
  const [prodi, setProdi] = useState('');
  const [opened, setOpened] = useState('');
  const [detail, setDetail] = useState(null);

  const matched = opened ? data.filter((k) => k.prodi === opened) : [];
  const visible = opened ? (matched.length ? matched : data) : [];

  if (isLoading) return <PageSkeleton showFilter={false} tableCols={5} />;

  const columns = [
    { header: 'No.', render: (_, idx) => idx + 1 },
    { key: 'nama', header: 'Kurikulum' },
    { key: 'tahun', header: 'Tahun' },
    { key: 'masaIdeal', header: 'Masa Studi Ideal' },
    { key: 'masaMaks', header: 'Masa Studi Maks.' },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button type="button" className="btn btn-xs btn-info" onClick={() => setDetail(row)}>
            Detail
          </button>
          <Link to={`/kurikulum/data/${row.id}/edit`} className="btn btn-xs btn-warning">
            Edit
          </Link>
          <button type="button" className="btn btn-xs btn-error" onClick={() => del.askDelete(row)}>
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Kurikulum"
        subtitle="Pilih program studi untuk melihat data kurikulum"
        breadcrumbs={[{ label: 'Kurikulum' }, { label: 'Data Kurikulum' }]}
      />

      <Card title="Data Kurikulum">
        <div className="max-w-xl">
          <label className="label py-1">
            <span className="label-text font-medium text-xs">Pilih Program Studi</span>
          </label>
          <select className="select select-bordered w-full" value={prodi} onChange={(e) => setProdi(e.target.value)}>
            <option value="">-- Pilih Program Studi --</option>
            {PROGRAM_STUDI_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <div className="mt-4">
            <Button variant="outline" size="sm" className="font-semibold" disabled={!prodi} onClick={() => setOpened(prodi)}>
              BUKA &raquo;
            </Button>
          </div>
        </div>
      </Card>

      {opened && (
        <Card
          title={`Kurikulum — ${opened}`}
          actions={
            <Link to={`/kurikulum/data/baru?prodi=${encodeURIComponent(opened)}`}>
              <Button size="sm" className="gap-1.5">
                <Plus size={14} /> Tambahkan Data
              </Button>
            </Link>
          }
        >
          <DataTable columns={columns} data={visible} rowKey={(r) => r.id} />
        </Card>
      )}

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Kurikulum" subtitle={detail?.nama}>
        {detail && (
          <DetailList
            items={[
              { label: 'Nama', value: detail.nama },
              { label: 'Tahun', value: detail.tahun },
              { label: 'SK Rektor', value: detail.skRektor },
              { label: 'Tgl keputusan', value: detail.tanggalKeputusan },
              { label: 'Pihak menyetujui', value: detail.pihak },
              { label: 'Tgl disetujui', value: detail.tanggalDisetujui },
              { label: 'Masa ideal', value: detail.masaIdeal },
              { label: 'Masa maksimum', value: detail.masaMaks },
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

import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/common/DataTable';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { useResourceItem } from '../../hooks/useResourceQuery';

export const KelasKelolaPage = () => {
  const { id } = useParams();
  const kelas = useResourceItem('kelas', id);

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'krs_id', header: 'KRS', sortable: true },
    { key: 'approved', header: 'Status', sortable: true },
  ];

  if (kelas.isPending) return <PageSkeleton cards={2} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Kelas"
        subtitle={kelas.data?.nama}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Kelas', path: '/perkuliahan/kelas' },
          { label: kelas.data?.nama || 'Kelas' },
        ]}
      />

      <Card title="Informasi Kelas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="text-base-content/60">Nama kelas:</span> <strong>{kelas.data?.nama}</strong>
          </p>
          <p>
            <span className="text-base-content/60">Mata kuliah:</span>{' '}
            <strong>{kelas.data?.matakuliah?.nama_resmi}</strong>
          </p>
          <p>
            <span className="text-base-content/60">SKS:</span> {kelas.data?.matakuliah?.jumlah_sks_kurikulum}
          </p>
          <p>
            <span className="text-base-content/60">Kuota:</span> {kelas.data?.jumlah_peserta_min} — {kelas.data?.jumlah_peserta_max}
          </p>
        </div>
      </Card>

      <Card title="Daftar Peserta">
        <DataTable
          resource="kelas-peserta"
          columns={columns}
          extraFilter={id ? { kelas_id: id } : undefined}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari peserta..."
        />
        <Link to="/perkuliahan/kelas" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};

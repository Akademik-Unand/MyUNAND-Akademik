import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/common/DataTable';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { useResourceItem } from '../../hooks/useResourceQuery';

export const UploadNilaiKelolaPage = () => {
  const { id } = useParams();
  const kelas = useResourceItem('kelas', id);

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'krs_detil_id', header: 'KRS Detil', sortable: true },
    {
      key: 'sumber_penilaian_id',
      header: 'Sumber',
      render: (row) => row.sumberPenilaian?.nama_sumber_penilaian || '—',
    },
    { key: 'nilai', header: 'Nilai', sortable: true },
    { key: 'catatan', header: 'Catatan' },
  ];

  if (kelas.isPending) return <PageSkeleton cards={1} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Nilai"
        subtitle={`${kelas.data?.nama || ''} · ${kelas.data?.matakuliah?.nama_resmi || ''}`}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Upload Nilai', path: '/perkuliahan/upload-nilai' },
          { label: kelas.data?.nama || 'Kelas' },
        ]}
      />
      <Card title="Daftar Nilai Mahasiswa">
        <DataTable
          resource="nilai-kelas"
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nilai..."
        />
        <Link to="/perkuliahan/upload-nilai" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};

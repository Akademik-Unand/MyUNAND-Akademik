import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { DetailList } from '../../components/common/DetailList';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { useResourceItem } from '../../hooks/useResourceQuery';

export const LaporanCPViewPage = () => {
  const { id } = useParams();
  const query = useResourceItem('laporan-cp', id);
  const laporan = query.data;

  if (query.isPending) return <PageSkeleton cards={2} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={laporan?.nama_laporan || 'Laporan CP'}
        subtitle="Pratinjau laporan capaian pembelajaran"
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Laporan CP', path: '/perkuliahan/laporan-cp' },
          { label: 'Lihat' },
        ]}
      />

      <Card title="Informasi Laporan">
        <DetailList
          items={[
            { label: 'Nama', value: laporan?.nama_laporan },
            { label: 'Keterangan', value: laporan?.keterangan || '—' },
            { label: 'Dibuat oleh', value: laporan?.pembuat?.name },
            { label: 'Program studi', value: laporan?.programStudi?.nama_resmi },
            { label: 'Kurikulum', value: laporan?.kurikulum?.nama },
            { label: 'Berkas', value: laporan?.file_path || '—' },
          ]}
        />
        <Link to="/perkuliahan/laporan-cp" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};

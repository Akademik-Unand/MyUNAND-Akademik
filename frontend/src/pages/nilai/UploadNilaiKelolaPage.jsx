import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { KelasInfoCard } from '../../components/kelas/KelasInfoCard';
import { KelasHub } from '../../components/kelas/KelasHub';
import { useResourceItem } from '../../hooks/useResourceQuery';
import { kelasDisplayName, kelasTitle } from '../../helpers/kelasInfo';

export const UploadNilaiKelolaPage = () => {
  const { id } = useParams();
  const kelas = useResourceItem('kelas', id);
  const title = kelasTitle(kelas.data);
  const display = kelasDisplayName(kelas.data);

  if (kelas.isPending) return <PageSkeleton cards={2} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={display}
        subtitle={title}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Upload Nilai', path: '/perkuliahan/upload-nilai' },
          { label: display },
        ]}
      />

      <KelasInfoCard kelas={kelas.data} />
      <KelasHub kelas={kelas.data} nilaiToolbar="upload" />

      <Link to="/perkuliahan/upload-nilai" className="btn btn-ghost btn-sm">
        Kembali
      </Link>
    </div>
  );
};

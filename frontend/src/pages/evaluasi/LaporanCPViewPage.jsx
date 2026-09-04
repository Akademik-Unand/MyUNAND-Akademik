import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { DetailList } from '../../components/common/DetailList';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { LaporanCpReportTable } from '../../components/laporan-cp/LaporanCpReportTable';
import { LaporanCpMatakuliahModal } from '../../components/laporan-cp/LaporanCpMatakuliahModal';
import { useResourceItem } from '../../hooks/useResourceQuery';
import { useLaporanCpPreview } from '../../hooks/useLaporanCpPreview';
import { selectedFromItems, withGroupedCapaian } from '../../helpers/laporanCp';
import { semesterDanSebelumnyaLabel } from '../../helpers/semesterProdi';

export const LaporanCPViewPage = () => {
  const { id } = useParams();
  const [selectedMk, setSelectedMk] = useState(null);
  const query = useResourceItem('laporan-cp', id);
  const laporan = query.data;
  const preview = useLaporanCpPreview(laporan?.kurikulum_id, laporan?.semester_id, {
    enabled: Boolean(laporan?.kurikulum_id),
  });
  const selected = selectedFromItems(laporan?.items || []);
  const rows = withGroupedCapaian((preview.data || []).filter((row) => selected.has(row.id)));

  if (query.isPending) return <PageSkeleton cards={2} />;

  return (
    <div className="space-y-4">
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
            { label: 'Judul', value: laporan?.nama_laporan },
            { label: 'Keterangan', value: laporan?.keterangan || '—' },
            { label: 'Dibuat oleh', value: laporan?.pembuat?.name },
            { label: 'Program studi', value: laporan?.programStudi?.nama_resmi },
            { label: 'Kurikulum', value: laporan?.kurikulum?.nama },
            { label: 'Semester', value: laporan?.semester_id ? semesterDanSebelumnyaLabel(laporan?.semester) : 'Semua semester' },
          ]}
        />
      </Card>

      <Card title="Isi laporan">
        {preview.isPending ? (
          <PageSkeleton showFilter={false} tableCols={8} />
        ) : (
          <LaporanCpReportTable
            rows={rows}
            onMatakuliahClick={(row) =>
              setSelectedMk({ id: row.matakuliah_id, semester_id: row.semester_id || null })
            }
          />
        )}
        <Link to="/perkuliahan/laporan-cp" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>

      <LaporanCpMatakuliahModal
        matakuliahId={selectedMk?.id}
        semesterId={selectedMk?.semester_id}
        kurikulumId={laporan?.kurikulum_id}
        onClose={() => setSelectedMk(null)}
      />
    </div>
  );
};

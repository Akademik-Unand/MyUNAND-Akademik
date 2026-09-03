import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MKSemesterLayout } from '../components/mk-semester/MKSemesterLayout';
import { CPMKSemesterTable } from '../components/mk-semester/CPMKSemesterTable';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { useResourceQuery } from '../hooks/useResourceQuery';
import { FILTER_SEMESTER } from '../constants/mockData';

export const MKSemesterKelolaPage = () => {
  const { kode } = useParams();
  const [semester, setSemester] = useState(FILTER_SEMESTER[0]);
  const query = useResourceQuery('cpmk-semester');

  if (query.isPending) return <PageSkeleton showFilter={false} tableCols={7} />;

  return (
    <MKSemesterLayout active="pengaturan" semester={semester} onSemesterChange={setSemester}>
      <Card
        title="Pengaturan CPMK Semester"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to={`/kurikulum/cpmk/${encodeURIComponent(kode || '')}`}>
              <Button variant="secondary" size="sm">
                Lihat Master CPMK Kurikulum
              </Button>
            </Link>
            <Link to={`/perkuliahan/mk-semester/${encodeURIComponent(kode || '')}/atur`}>
              <Button size="sm">Atur CPMK Semester ini</Button>
            </Link>
          </div>
        }
      >
        <CPMKSemesterTable items={query.data ?? []} />
        <Link to="/perkuliahan/mk-semester" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </MKSemesterLayout>
  );
};

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MKSemesterLayout } from '../../components/mk-semester/MKSemesterLayout';
import { CPMKSemesterTable } from '../../components/mk-semester/CPMKSemesterTable';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { Can } from '../../components/auth/Can';
import { useResourceQuery } from '../../hooks/useResourceQuery';

export const MKSemesterKelolaPage = () => {
  const { id } = useParams();
  const [semester, setSemester] = useState('');
  const query = useResourceQuery('cpmk-semester', {
    params: id ? { filter: { matakuliah_id: id } } : {},
    enabled: Boolean(id),
  });

  if (query.isPending) return <PageSkeleton showFilter={false} tableCols={4} />;

  return (
    <MKSemesterLayout semester={semester} onSemesterChange={setSemester}>
      <Card
        title="Pengaturan CPMK Semester"
        actions={
          <div className="flex flex-wrap gap-2">
            <Can I="read" a="Cpmk">
              <Link to={`/kurikulum/cpmk/${id}`}>
                <Button variant="secondary" size="sm">
                  Lihat Master CPMK Kurikulum
                </Button>
              </Link>
            </Can>
            <Can I="update" a="Cpmk">
              <Link to={`/perkuliahan/mk-semester/${id}/atur`}>
                <Button size="sm">Atur CPMK Semester ini</Button>
              </Link>
            </Can>
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

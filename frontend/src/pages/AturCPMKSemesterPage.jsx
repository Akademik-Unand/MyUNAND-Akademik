import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { AturCPMKSemesterForm } from '../components/mk-semester/AturCPMKSemesterForm';
import { findMataKuliah } from '../helpers/mkSemester';
import { ATUR_CPMK_SEMESTER } from '../constants/mockData';

const cloneForm = () => JSON.parse(JSON.stringify(ATUR_CPMK_SEMESTER));

export const AturCPMKSemesterPage = () => {
  const { kode } = useParams();
  const mk = findMataKuliah(kode);
  const navigate = useNavigate();
  const [items, setItems] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setItems(cloneForm()), 350);
    return () => clearTimeout(timer);
  }, []);

  const back = `/perkuliahan/mk-semester/${encodeURIComponent(mk.kode)}`;

  if (!items) return <PageSkeleton showFilter={false} cards={3} />;

  const save = () => {
    toast.success('Pengaturan CPMK semester disimpan', {
      description: 'Perubahan hanya disimpan di sesi ini (data mock).',
    });
    navigate(back);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atur CPMK Semester"
        subtitle={`${mk.nama} · ${mk.kode}`}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'MK Semester', path: '/perkuliahan/mk-semester' },
          { label: mk.kode, path: back },
          { label: 'Atur CPMK' },
        ]}
      />

      <Card title={`Pilih CPMK Semester ${mk.semester} untuk Matakuliah ${mk.nama}`}>
        <AturCPMKSemesterForm items={items} onChange={setItems} />
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(back)}>
            Batal
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setItems(cloneForm())}>
            Reset
          </Button>
          <Button size="sm" onClick={save}>
            Simpan
          </Button>
        </div>
      </Card>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { AturCPMKSemesterForm } from '../../components/mk-semester/AturCPMKSemesterForm';
import { useResourceItem, useResourceQuery } from '../../hooks/useResourceQuery';
import {
  createResourceItem,
  deleteResourceItem,
  updateResourceItem,
} from '../../services/api';
import { Can } from '../../components/auth/Can';
import { mkKode, mkLabel } from '../../helpers/mkSemester';

export const AturCPMKSemesterPage = () => {
  const { id } = useParams();
  const mk = useResourceItem('matakuliah', id);
  const query = useResourceQuery('cpmk-semester', {
    params: id ? { filter: { matakuliah_id: id } } : {},
    enabled: Boolean(id),
  });
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const back = `/perkuliahan/mk-semester/${id}`;

  useEffect(() => {
    if (query.data) setItems(query.data.map((row) => ({ ...row, sumberPenilaian: row.sumberPenilaian || [] })));
  }, [query.data]);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      for (const cpmk of items) {
        for (const removed of cpmk.removedSumber || []) {
          await deleteResourceItem('sumber-penilaian', removed.id);
        }
        for (const row of cpmk.sumberPenilaian || []) {
          const payload = {
            cpmk_id: cpmk.id,
            nama_sumber_penilaian: row.nama_sumber_penilaian,
            bobot: Number(row.bobot || 0),
          };
          if (row.isNew) {
            if (!payload.nama_sumber_penilaian) continue;
            await createResourceItem('sumber-penilaian', payload);
          } else {
            await updateResourceItem('sumber-penilaian', row.id, payload);
          }
        }
      }
      toast.success('Pengaturan CPMK semester disimpan');
      navigate(back);
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan CPMK semester');
    } finally {
      setSaving(false);
    }
  };

  if (mk.isPending || query.isPending) return <PageSkeleton showFilter={false} cards={3} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atur CPMK Semester"
        subtitle={`${mkLabel(mk.data)} · ${mkKode(mk.data)}`}
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'MK Semester', path: '/perkuliahan/mk-semester' },
          { label: mkKode(mk.data) || 'MK', path: back },
          { label: 'Atur CPMK' },
        ]}
      />

      <Card title={`Sumber penilaian untuk ${mkLabel(mk.data)}`}>
        <AturCPMKSemesterForm items={items} onChange={setItems} />
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(back)} disabled={saving}>
            Batal
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setItems(query.data?.map((row) => ({ ...row, sumberPenilaian: row.sumberPenilaian || [] })) || [])}
            disabled={saving}
          >
            Reset
          </Button>
          <Can I="update" a="Cpmk">
            <Button size="sm" onClick={save} isLoading={saving}>
              Simpan
            </Button>
          </Can>
        </div>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FilterBar } from '../components/common/FilterBar';
import { PageSkeleton } from '../components/common/PageSkeleton';
import { useResourceQuery } from '../hooks/useResourceQuery';
import { useResourceMutations } from '../hooks/useResourceMutations';
import { FILTER_DEPARTEMEN, FILTER_PRODI, FILTER_KURIKULUM, FILTER_SEMESTER } from '../constants/mockData';

const filterFields = [
  { label: 'Departemen', placeholder: 'Pilih Departemen', options: FILTER_DEPARTEMEN.map((d) => ({ value: d, label: d })) },
  { label: 'Prodi', placeholder: 'Pilih', options: FILTER_PRODI.map((p) => ({ value: p, label: p })) },
  { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: FILTER_KURIKULUM.map((k) => ({ value: k, label: k })) },
  { label: 'Semester', placeholder: 'Pilih Semester', options: FILTER_SEMESTER.map((s) => ({ value: s, label: s })) },
];

export const MKTranskripAturPage = () => {
  const navigate = useNavigate();
  const query = useResourceQuery('mk-transkrip');
  const mutations = useResourceMutations('mk-transkrip');
  const [selected, setSelected] = useState(null);

  if (query.isPending) return <PageSkeleton tableCols={2} />;

  const rows = query.data ?? [];
  const defaultSelected = rows.filter((row) => row.transkrip === 'Ya').map((row) => row.kode);
  const checked = selected ?? defaultSelected;
  const allSelected = rows.length > 0 && checked.length === rows.length;
  const midpoint = Math.ceil(rows.length / 2);
  const columns = [rows.slice(0, midpoint), rows.slice(midpoint)];

  const toggle = (kode) => {
    setSelected((prev) => {
      const current = prev ?? defaultSelected;
      return current.includes(kode) ? current.filter((item) => item !== kode) : [...current, kode];
    });
  };

  const reset = () => setSelected(defaultSelected);

  const save = () => {
    mutations.replaceAll.mutate(
      rows.map((row) => ({ ...row, transkrip: checked.includes(row.kode) ? 'Ya' : 'Tidak' })),
      {
        onSuccess: () => {
          toast.success('MK transkrip disimpan', {
            description: 'Perubahan hanya disimpan di sesi ini (data mock).',
          });
          navigate('/perkuliahan/mk-semester');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atur Matakuliah Transkrip"
        subtitle="Pilih mata kuliah yang masuk ke transkrip capaian pembelajaran"
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'MK Semester', path: '/perkuliahan/mk-semester' },
          { label: 'Atur Transkrip' },
        ]}
      />

      <Card>
        <FilterBar fields={filterFields} />
      </Card>

      <Card title="Daftar Mata Kuliah">
        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={allSelected}
            onChange={(e) => setSelected(e.target.checked ? rows.map((row) => row.kode) : [])}
          />
          Check All
        </label>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {columns.map((group, idx) => (
            <div key={idx} className="space-y-2">
              {group.map((row) => (
                <label key={row.kode} className="flex cursor-pointer items-start gap-2 rounded-box px-2 py-1.5 hover:bg-base-200">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary mt-0.5"
                    checked={checked.includes(row.kode)}
                    onChange={() => toggle(row.kode)}
                  />
                  <span className="text-sm">
                    <span className="font-medium">{row.kode}</span> — {row.nama}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/perkuliahan/mk-semester')}>
            Batal
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
          <Button size="sm" onClick={save} isLoading={mutations.replaceAll.isPending}>
            Simpan
          </Button>
        </div>
      </Card>
    </div>
  );
};

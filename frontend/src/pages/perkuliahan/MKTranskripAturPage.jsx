import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { useResourceQuery } from '../../hooks/useResourceQuery';
import { useFilterOptions } from '../../hooks/useFilterOptions';
import { updateResourceItem } from '../../services/api';

export const MKTranskripAturPage = () => {
  const navigate = useNavigate();
  const query = useResourceQuery('mk-transkrip');
  const filters = useFilterOptions();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  if (query.isPending) return <PageSkeleton tableCols={2} />;

  const rows = query.data ?? [];
  const defaultSelected = rows.filter((row) => row.status === 'transkrip').map((row) => row.id);
  const checked = selected ?? defaultSelected;
  const allSelected = rows.length > 0 && checked.length === rows.length;
  const midpoint = Math.ceil(rows.length / 2);
  const columns = [rows.slice(0, midpoint), rows.slice(midpoint)];

  const toggle = (id) => {
    setSelected((prev) => {
      const current = prev ?? defaultSelected;
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
  };

  const reset = () => setSelected(defaultSelected);

  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      for (const row of rows) {
        const next = checked.includes(row.id) ? 'transkrip' : null;
        if ((row.status || null) === next) continue;
        await updateResourceItem('mk-transkrip', row.id, { status: next });
      }
      toast.success('MK transkrip disimpan');
      navigate('/perkuliahan/mk-semester');
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan MK transkrip');
    } finally {
      setSaving(false);
    }
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
        <FilterBar
          fields={[
            { label: 'Departemen', placeholder: 'Pilih Departemen', options: filters.departemen },
            { label: 'Prodi', placeholder: 'Pilih', options: filters.prodi },
            { label: 'Kurikulum', placeholder: 'Pilih Kurikulum', options: filters.kurikulum },
            { label: 'Semester', placeholder: 'Pilih Semester', options: filters.semester },
          ]}
        />
      </Card>

      <Card title="Daftar Mata Kuliah">
        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={allSelected}
            onChange={(e) => setSelected(e.target.checked ? rows.map((row) => row.id) : [])}
          />
          Check All
        </label>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {columns.map((group, idx) => (
            <div key={idx} className="space-y-2">
              {group.map((row) => (
                <label key={row.id} className="flex cursor-pointer items-start gap-2 rounded-box px-2 py-1.5 hover:bg-base-200">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm checkbox-primary mt-0.5"
                    checked={checked.includes(row.id)}
                    onChange={() => toggle(row.id)}
                  />
                  <span className="text-sm">
                    <span className="font-medium">{row.matakuliah?.kode_matakuliah}</span> — {row.matakuliah?.nama_resmi}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/perkuliahan/mk-semester')} disabled={saving}>
            Batal
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
            Reset
          </Button>
          <Button size="sm" onClick={save} isLoading={saving}>
            Simpan
          </Button>
        </div>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { useResourceQuery } from '../../hooks/useResourceQuery';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';
import { Can } from '../../components/auth/Can';
import { updateResourceItem } from '../../services/api';

const FILTER_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum'];

export const MKTranskripAturPage = () => {
  const navigate = useNavigate();
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const extraFilter = academic.extraFilter;
  const query = useResourceQuery('mk-transkrip', {
    params: extraFilter ? { filter: extraFilter } : {},
    enabled: Boolean(extraFilter),
  });
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const rows = extraFilter ? (query.data ?? []) : [];
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

      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={() => {
            setSelected(null);
            academic.apply();
          }}
          onReset={() => {
            setSelected(null);
            academic.reset();
          }}
          applyDisabled={!academic.canApply}
        />
      </Card>

      <Card title="Daftar Mata Kuliah">
        {!extraFilter && (
          <p className="text-sm text-base-content/60">Pilih fakultas hingga kurikulum, lalu klik Terapkan.</p>
        )}
        {extraFilter && query.isPending && <PageSkeleton tableCols={2} />}
        {extraFilter && !query.isPending && (
          <>
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
          <Can I="update" a="MatakuliahKurikulum">
            <Button size="sm" onClick={save} isLoading={saving}>
              Simpan
            </Button>
          </Can>
        </div>
          </>
        )}
      </Card>
    </div>
  );
};

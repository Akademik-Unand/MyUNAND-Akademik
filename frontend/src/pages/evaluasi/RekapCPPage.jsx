import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { PillTabs } from '../../components/ui/PillTabs';
import { RekapCpExtraFilters } from '../../components/rekap-cp/RekapCpExtraFilters';
import { RekapCpChart } from '../../components/rekap-cp/RekapCpChart';
import { rekapCpColumns } from '../../components/rekap-cp/rekapCpColumns';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';
import { useRekapCpGrafik } from '../../hooks/useRekapCpGrafik';

const FILTER_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum', 'semester'];
const TABS = [
  { id: 'rekap', label: 'Rekap CP' },
  { id: 'grafik', label: 'Grafik' },
];

export const RekapCPPage = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'rekap';
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const [extraApplied, setExtraApplied] = useState({});

  const extraFilter = useMemo(
    () => ({ ...(academic.extraFilter || {}), ...extraApplied }),
    [academic.extraFilter, extraApplied]
  );

  const grafik = useRekapCpGrafik(extraFilter, { enabled: tab === 'grafik' });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rekap Nilai CP"
        subtitle="Capaian CP/SCP per mahasiswa, mata kuliah, dan sumber penilaian"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Rekap Nilai CP' }]}
      />

      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={academic.apply}
          onReset={() => {
            academic.reset();
            setExtraApplied({});
          }}
          applyDisabled={!academic.canApply}
        />
      </Card>

      <Card title="Filter Data">
        <RekapCpExtraFilters
          academicFilter={academic.extraFilter || {}}
          onApply={setExtraApplied}
          onReset={() => setExtraApplied({})}
        />
      </Card>

      <PillTabs
        items={TABS}
        value={tab}
        onChange={(id) => {
          const next = new URLSearchParams(params);
          next.set('tab', id);
          setParams(next, { replace: true });
        }}
      />

      {tab === 'rekap' ? (
        <Card title="Rekap CP">
          <DataTable
            resource="rekap-cp-detail"
            columns={rekapCpColumns}
            extraFilter={extraFilter}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari BP, nama, atau mata kuliah..."
            striped={false}
          />
        </Card>
      ) : (
        <Card title="Grafik">
          {grafik.isError ? (
            <p className="text-sm text-error">{grafik.error?.message || 'Gagal memuat grafik.'}</p>
          ) : (
            <RekapCpChart rows={grafik.data || []} isPending={grafik.isPending} />
          )}
        </Card>
      )}
    </div>
  );
};

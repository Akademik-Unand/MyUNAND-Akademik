import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { PillTabs } from '../../components/ui/PillTabs';
import { KelasHistoryPanel } from '../../components/kelas/KelasHistoryPanel';
import { buildKelasListColumns } from '../../components/kelas/kelasListColumns';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';
import { useCan } from '../../hooks/useCan';

const FILTER_KEYS = ['departemen', 'prodi', 'kurikulum', 'semester'];
const TABS = [
  { id: 'kelas', label: 'Daftar Kelas' },
  { id: 'history', label: 'History Upload Nilai' },
];

const columns = buildKelasListColumns({
  actionTo: (row) => `/perkuliahan/upload-nilai/${row.id}`,
  actionLabel: 'Kelola nilai',
  showProgress: false,
  actionButton: true,
  actionGate: { any: [{ I: 'upload', a: 'NilaiMahasiswa' }, { I: 'update', a: 'NilaiMahasiswa' }] },
});

export const UploadNilaiPage = () => {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'kelas';
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const extraFilter = academic.extraFilter;
  const can = useCan();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Upload Nilai oleh Departemen"
        subtitle="Unggah dan kelola nilai perkuliahan per kelas"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Upload Nilai' }]}
      />
      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={academic.apply}
          onReset={academic.reset}
          applyDisabled={!academic.canApply}
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

      {tab === 'kelas' ? (
        <Card title="Daftar Kelas">
          <DataTable
            resource="upload-nilai"
            tableKey="unl_"
            columns={columns}
            extraFilter={extraFilter}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari kelas atau mata kuliah..."
          />
        </Card>
      ) : can('read', 'HistoryUploadNilai') ? (
        <KelasHistoryPanel extraFilter={extraFilter} tableKey="unh_" />
      ) : (
        <Card title="History Upload Nilai">
          <p className="text-sm text-base-content/60">Anda tidak punya akses ke riwayat unggah nilai.</p>
        </Card>
      )}
    </div>
  );
};

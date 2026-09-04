import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';
import { kelasListColumns } from '../../components/kelas/kelasListColumns';

const FILTER_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum', 'semester'];

export const KelasPage = () => {
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const extraFilter = academic.extraFilter;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Daftar Kelas"
        subtitle="Daftar kelas perkuliahan per semester"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Kelas' }]}
      />
      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={academic.apply}
          onReset={academic.reset}
          applyDisabled={!academic.canApply}
        />
      </Card>
      <Card title="Daftar Kelas">
        <DataTable
          resource="kelas"
          columns={kelasListColumns}
          extraFilter={extraFilter}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari kelas atau mata kuliah..."
        />
      </Card>
    </div>
  );
};

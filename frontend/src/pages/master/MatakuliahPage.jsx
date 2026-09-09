import { MasterListPage } from '../../components/master/MasterListPage';
import { MatakuliahForm } from '../../components/master/MatakuliahForm';
import { FilterBar } from '../../components/common/FilterBar';
import { Card } from '../../components/ui/Card';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';

const emptyForm = {
  program_studi_id: '',
  kode_matakuliah: '',
  nama_resmi: '',
  jenis_semester_id: '',
  tipe_matakuliah_id: '',
  sifat_matakuliah_id: '',
  semester_kurikulum: 0,
  jumlah_sks_kurikulum: 0,
  jumlah_sks_teori: 0,
  jumlah_sks_praktikum: 0,
  jumlah_sks_praktikum_lapangan: 0,
  bobot_nilai_minimal_lulus: 0,
};

export const MatakuliahPage = () => {
  const academic = useAcademicFilter({ keys: ['fakultas', 'departemen', 'prodi'] });

  return (
    <MasterListPage
      title="Mata Kuliah"
      subtitle="Kelola master mata kuliah berdasarkan program studi"
      breadcrumbs={[{ label: 'Master Data' }, { label: 'Mata Kuliah' }]}
      subject="Matakuliah"
      resource="matakuliah"
      idKey="id"
      FormComponent={MatakuliahForm}
      emptyForm={emptyForm}
      createDefaults={{ program_studi_id: academic.applied.prodi || '' }}
      extraFilter={academic.extraFilter}
      beforeTable={(
        <Card title="Filter Mata Kuliah">
          <FilterBar
            fields={academic.fields}
            onApply={academic.apply}
            onReset={academic.reset}
            applyDisabled={!academic.canApply}
          />
        </Card>
      )}
      rowKey={(row) => row.id}
      columns={[
        { key: 'program_studi_id', header: 'Program Studi', sortable: true, render: (row) => row.programStudi?.nama_resmi || '—' },
        { key: 'kode_matakuliah', header: 'Kode', sortable: true },
        { key: 'nama_resmi', header: 'Nama Mata Kuliah', sortable: true },
        { key: 'jumlah_sks_kurikulum', header: 'SKS', sortable: true },
        { key: 'semester_kurikulum', header: 'Semester', sortable: true },
      ]}
      detailItems={(row) => [
        { label: 'Program Studi', value: row.programStudi?.nama_resmi },
        { label: 'Kode', value: row.kode_matakuliah },
        { label: 'Nama', value: row.nama_resmi },
        { label: 'SKS', value: row.jumlah_sks_kurikulum },
        { label: 'Semester Kurikulum', value: row.semester_kurikulum },
      ]}
    />
  );
};

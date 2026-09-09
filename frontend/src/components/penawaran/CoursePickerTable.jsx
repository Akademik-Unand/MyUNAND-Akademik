import { DataTable } from '../common/DataTable';

export const CoursePickerTable = ({ courses, selected, onToggle, onToggleAll }) => {
  const allSelected = courses.length > 0 && courses.every((row) => selected.includes(row.id));
  return <DataTable data={courses} tableKey="course_pick_" rowKey={(row) => row.id} searchableFields={['kode_matakuliah', 'nama_resmi']} searchPlaceholder="Cari mata kuliah program studi..." emptyText="Pilih semester/program studi untuk memuat mata kuliah." columns={[{ header: <input type="checkbox" className="checkbox checkbox-sm" checked={allSelected} onChange={(event) => onToggleAll(event.target.checked)} aria-label="Pilih semua mata kuliah" />, render: (row) => <input type="checkbox" className="checkbox checkbox-sm" checked={selected.includes(row.id)} onChange={() => onToggle(row.id)} aria-label={`Pilih ${row.nama_resmi}`} /> }, { key: 'kode_matakuliah', header: 'Kode', sortable: true }, { key: 'nama_resmi', header: 'Mata Kuliah', sortable: true }, { key: 'jumlah_sks_kurikulum', header: 'SKS', sortable: true }, { key: 'semester_kurikulum', header: 'Semester Kurikulum', sortable: true }]} />;
};

import { useResourceQuery } from './useResourceQuery';

const toOptions = (rows, getLabel) =>
  (rows || []).map((row) => ({ value: row.id, label: getLabel(row) }));

export const useFilterOptions = () => {
  const departemen = useResourceQuery('departemen');
  const prodi = useResourceQuery('prodi');
  const kurikulum = useResourceQuery('kurikulum');
  const semester = useResourceQuery('setting-semester');
  const jenjang = useResourceQuery('jenjang-akademik');

  return {
    departemen: toOptions(departemen.data, (row) => row.nama_resmi || row.nama_singkat),
    prodi: toOptions(prodi.data, (row) => row.nama_resmi || row.kode_prodi),
    kurikulum: toOptions(kurikulum.data, (row) => row.nama || String(row.tahun || row.id)),
    semester: toOptions(
      semester.data,
      (row) => `${row.jenisSemester?.nama || row.jenisSemester?.alias || 'Semester'} ${row.tahun}`
    ),
    jenjang: toOptions(jenjang.data, (row) => row.nama_jenjang || row.kode_jenjang),
  };
};

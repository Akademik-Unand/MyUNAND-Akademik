import { Input } from '../ui/Input';
import { ResourceSelect } from '../common/ResourceSelect';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';
import { Select } from '../ui/Select';

export const MatakuliahForm = ({ values, onChange }) => {
  const academic = useAcademicFilter({ keys: ['fakultas', 'departemen', 'prodi'] });
  const set = (key) => (event) => onChange({ ...values, [key]: event.target.value });
  const setAcademic = (key) => (event) => {
    const field = academic.fields.find((item) => item.name === key);
    field?.onChange(event);
    if (key === 'prodi') set('program_studi_id')(event);
  };
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {academic.fields.map((field) => <Select key={field.name} label={`${field.label}${field.name === 'prodi' ? ' *' : ''}`} options={field.options} value={field.name === 'prodi' ? values.program_studi_id || field.value : field.value} onChange={setAcademic(field.name)} disabled={field.disabled} placeholder={field.placeholder} required={field.name === 'prodi'} />)}
      <Input label="Kode Mata Kuliah *" value={values.kode_matakuliah || ''} onChange={set('kode_matakuliah')} required />
      <Input label="Nama Resmi *" value={values.nama_resmi || ''} onChange={set('nama_resmi')} required />
      <ResourceSelect resource="jenis-semester" label="Jenis Semester *" value={values.jenis_semester_id || ''} onChange={set('jenis_semester_id')} required />
      <ResourceSelect resource="tipe-matakuliah" label="Tipe Mata Kuliah" value={values.tipe_matakuliah_id || ''} onChange={set('tipe_matakuliah_id')} />
      <ResourceSelect resource="sifat-matakuliah" label="Sifat Mata Kuliah" value={values.sifat_matakuliah_id || ''} onChange={set('sifat_matakuliah_id')} />
      <Input label="Semester Kurikulum" type="number" min="0" value={values.semester_kurikulum ?? 0} onChange={set('semester_kurikulum')} />
      <Input label="Jumlah SKS *" type="number" min="0" value={values.jumlah_sks_kurikulum ?? 0} onChange={set('jumlah_sks_kurikulum')} required />
      <Input label="SKS Teori" type="number" min="0" value={values.jumlah_sks_teori ?? 0} onChange={set('jumlah_sks_teori')} />
      <Input label="SKS Praktikum" type="number" min="0" value={values.jumlah_sks_praktikum ?? 0} onChange={set('jumlah_sks_praktikum')} />
      <Input label="SKS Lapangan" type="number" min="0" value={values.jumlah_sks_praktikum_lapangan ?? 0} onChange={set('jumlah_sks_praktikum_lapangan')} />
      <Input label="Nilai Minimal Lulus" type="number" min="0" step="0.01" value={values.bobot_nilai_minimal_lulus ?? 0} onChange={set('bobot_nilai_minimal_lulus')} />
    </div>
  );
};

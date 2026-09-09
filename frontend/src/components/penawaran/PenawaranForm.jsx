import { Input } from '../ui/Input';
import { ResourceSelect } from '../common/ResourceSelect';
import { Select } from '../ui/Select';
import { semesterProdiLabel } from '../../helpers/semesterProdi';

export const PenawaranForm = ({ values, onChange }) => {
  const set = (key) => (event) => onChange({ ...values, [key]: event.target.value });
  const selectedOnly = values.akses === 'terpilih';
  const selectedPrograms = values.prodi_tujuan || [];

  const addProgram = (event) => {
    const programId = event.target.value;
    if (!programId || selectedPrograms.some((item) => item.program_studi_id === programId)) return;
    onChange({
      ...values,
      prodi_tujuan: [...selectedPrograms, { program_studi_id: programId, kuota: null }],
      prodi_akses_id: '',
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <ResourceSelect resource="semester-prodi" label="Semester Program Studi *" value={values.semester_prodi_id || ''} onChange={set('semester_prodi_id')} getLabel={semesterProdiLabel} required />
      <ResourceSelect resource="matakuliah" label="Mata Kuliah *" value={values.matakuliah_id || ''} onChange={set('matakuliah_id')} getLabel={(row) => `${row.kode_matakuliah} — ${row.nama_resmi}`} required />
      <Input label="Mulai Pendaftaran" type="datetime-local" value={values.tanggal_mulai || ''} onChange={set('tanggal_mulai')} />
      <Input label="Selesai Pendaftaran" type="datetime-local" value={values.tanggal_selesai || ''} onChange={set('tanggal_selesai')} />
      <Input label="Kuota Lintas Prodi *" type="number" min="0" value={values.kuota_lintas_prodi ?? ''} onChange={set('kuota_lintas_prodi')} required />
      <Select label="Akses Peserta *" value={values.akses || 'semua'} onChange={set('akses')} options={[{ value: 'semua', label: 'Semua Program Studi' }, { value: 'terpilih', label: 'Program Studi Terpilih' }]} />
      {selectedOnly && (
        <div className="space-y-2 md:col-span-2">
          <ResourceSelect resource="prodi" label="Tambahkan Program Studi" value={values.prodi_akses_id || ''} onChange={addProgram} />
          <div className="flex flex-wrap gap-2">
            {selectedPrograms.map((item) => (
              <button key={item.program_studi_id} type="button" className="badge badge-outline gap-1" onClick={() => onChange({ ...values, prodi_tujuan: selectedPrograms.filter((row) => row.program_studi_id !== item.program_studi_id) })}>
                {item.program_studi_id} ×
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

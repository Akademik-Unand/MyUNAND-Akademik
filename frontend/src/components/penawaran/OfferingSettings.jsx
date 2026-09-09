import { Input } from '../ui/Input';
import { ResourceSelect } from '../common/ResourceSelect';
import { Select } from '../ui/Select';
import { semesterProdiLabel } from '../../helpers/semesterProdi';

export const OfferingSettings = ({ values, onChange }) => {
  const set = (key) => (event) => onChange({ ...values, [key]: event.target.value });
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
    <ResourceSelect resource="semester-prodi" label="Semester / Program Studi *" value={values.semester_prodi_id} onChange={set('semester_prodi_id')} getLabel={semesterProdiLabel} required />
    <Input label="Mulai Pendaftaran *" type="datetime-local" value={values.tanggal_mulai} onChange={set('tanggal_mulai')} required />
    <Input label="Selesai Pendaftaran *" type="datetime-local" value={values.tanggal_selesai} onChange={set('tanggal_selesai')} required />
    <Input label="Kuota Lintas per Mata Kuliah *" type="number" min="0" value={values.kuota_lintas_prodi} onChange={set('kuota_lintas_prodi')} required />
    <Select label="Akses *" value={values.akses} onChange={set('akses')} options={[{ value: 'semua', label: 'Semua Program Studi' }, { value: 'terpilih', label: 'Program Studi Terpilih' }]} />
    {values.akses === 'terpilih' && <ResourceSelect resource="prodi" label="Program Studi Tujuan" value={values.prodi_tujuan?.[0] || ''} onChange={(event) => onChange({ ...values, prodi_tujuan: event.target.value ? [event.target.value] : [] })} required />}
  </div>;
};

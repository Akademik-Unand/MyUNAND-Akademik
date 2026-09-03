import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const DateRange = ({ label, start, end, onStart, onEnd }) => (
  <fieldset className="fieldset w-full gap-1 p-0">
    <legend className="fieldset-legend text-xs font-medium text-base-content/80">{label}</legend>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <input type="date" className="input input-sm w-full" value={start || ''} onChange={onStart} />
      <input type="date" className="input input-sm w-full" value={end || ''} onChange={onEnd} />
    </div>
  </fieldset>
);

export const SettingSemesterForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-4 max-w-2xl">
      <Input label="Tahun Ajaran *" value={values.tahun || ''} onChange={set('tahun')} placeholder="2024/2025" required />
      <Select
        label="Semester *"
        value={values.semester || ''}
        onChange={set('semester')}
        placeholder="Pilih semester"
        options={[
          { value: 'Ganjil', label: 'Ganjil' },
          { value: 'Genap', label: 'Genap' },
          { value: 'Pendek', label: 'Pendek' },
        ]}
      />
      <DateRange
        label="Periode Semester"
        start={values.periodeMulai}
        end={values.periodeSelesai}
        onStart={set('periodeMulai')}
        onEnd={set('periodeSelesai')}
      />
      <DateRange
        label="Rencana Studi"
        start={values.rencanaMulai}
        end={values.rencanaSelesai}
        onStart={set('rencanaMulai')}
        onEnd={set('rencanaSelesai')}
      />
      <DateRange
        label="Ubah Rencana Studi"
        start={values.ubahMulai}
        end={values.ubahSelesai}
        onStart={set('ubahMulai')}
        onEnd={set('ubahSelesai')}
      />
      <DateRange
        label="Input Nilai Online"
        start={values.nilaiMulai}
        end={values.nilaiSelesai}
        onStart={set('nilaiMulai')}
        onEnd={set('nilaiSelesai')}
      />
    </div>
  );
};

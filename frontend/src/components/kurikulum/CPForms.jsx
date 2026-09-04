import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

export const CPForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input
        label="Nama CP *"
        value={values.nama_cp || ''}
        onChange={set('nama_cp')}
        placeholder="CP 1"
        required
      />
      <Textarea label="Deskripsi" value={values.deskripsi || ''} onChange={set('deskripsi')} />
      <Input
        label="Nilai maksimal"
        type="number"
        value={values.nilai_max ?? 100}
        onChange={set('nilai_max')}
      />
      <Input
        label="Nilai minimal"
        type="number"
        value={values.nilai_min ?? 0}
        onChange={set('nilai_min')}
      />
    </div>
  );
};

export const SCPForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input
        label="Nama SCP *"
        value={values.nama_scp || ''}
        onChange={set('nama_scp')}
        placeholder="SCP 1"
        required
      />
      <Textarea label="Deskripsi" value={values.deskripsi || ''} onChange={set('deskripsi')} />
      <Input
        label="Persen capai nilai min"
        type="number"
        value={values.persen_capai_nilai_min ?? 0}
        onChange={set('persen_capai_nilai_min')}
      />
      <Input
        label="Nilai minimal"
        type="number"
        value={values.nilai_min ?? 0}
        onChange={set('nilai_min')}
      />
    </div>
  );
};

export const CPMKItemForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input
        label="Nama CPMK *"
        value={values.nama_cpmk || ''}
        onChange={set('nama_cpmk')}
        placeholder="CPMK 1"
        required
      />
      <Textarea label="Deskripsi" value={values.deskripsi || ''} onChange={set('deskripsi')} />
    </div>
  );
};

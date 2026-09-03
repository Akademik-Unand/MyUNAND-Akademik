import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

export const CPForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input label="Nama CP *" value={values.kode || ''} onChange={set('kode')} placeholder="SO A" required />
      <Textarea label="Deskripsi *" value={values.deskripsi || ''} onChange={set('deskripsi')} required />
      <Input label="Target (%) *" value={values.target || '60'} onChange={set('target')} />
      <Input label="Nilai Minimal *" value={values.nilaiMinimal || '55'} onChange={set('nilaiMinimal')} />
    </div>
  );
};

export const SCPForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input label="Kode SCP *" value={values.kode || ''} onChange={set('kode')} placeholder="PI 1" required />
      <Textarea label="Deskripsi *" value={values.deskripsi || ''} onChange={set('deskripsi')} required />
      <Input label="Target *" value={values.target || '60%'} onChange={set('target')} />
      <Input label="Nilai Minimal *" value={values.nilaiMinimal || '55 dari skala 100'} onChange={set('nilaiMinimal')} />
    </div>
  );
};

export const CPMKItemForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input label="Nama CPMK *" value={values.nama || ''} onChange={set('nama')} placeholder="CPMK 4" required />
      <Textarea label="Deskripsi *" value={values.deskripsi || ''} onChange={set('deskripsi')} required />
      <Input label="Kode CPL" value={values.cpl || ''} onChange={set('cpl')} placeholder="SO A" />
      <Input label="Kode PI" value={values.pi || ''} onChange={set('pi')} placeholder="PI 1" />
    </div>
  );
};

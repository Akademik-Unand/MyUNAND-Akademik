import { Input } from '../ui/Input';

export const KurikulumForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3 max-w-2xl">
      <Input label="Nama Kurikulum *" value={values.nama || ''} onChange={set('nama')} required />
      <Input label="Tahun Kurikulum *" type="number" value={values.tahun || ''} onChange={set('tahun')} required />
      <Input label="Keputusan Rektor" value={values.skRektor || ''} onChange={set('skRektor')} />
      <Input label="Tanggal Keputusan" type="date" value={values.tanggalKeputusan || ''} onChange={set('tanggalKeputusan')} />
      <Input label="Pihak yang Menyetujui" value={values.pihak || ''} onChange={set('pihak')} />
      <Input label="Tanggal Disetujui" type="date" value={values.tanggalDisetujui || ''} onChange={set('tanggalDisetujui')} />
      <Input label="Masa Studi Ideal *" type="number" value={values.masaIdeal || ''} onChange={set('masaIdeal')} required />
      <Input label="Masa Studi Maksimum *" type="number" value={values.masaMaks || ''} onChange={set('masaMaks')} required />
    </div>
  );
};

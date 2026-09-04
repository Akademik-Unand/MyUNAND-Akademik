import { Input } from '../ui/Input';
import { ResourceSelect } from '../common/ResourceSelect';

export const FakultasForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input
        label="Kode Fakultas *"
        name="kode_fakultas"
        value={values.kode_fakultas || ''}
        onChange={set('kode_fakultas')}
        maxLength={15}
        required
      />
      <ResourceSelect
        resource="universitas"
        label="Universitas"
        name="universitas_id"
        value={values.universitas_id || ''}
        onChange={set('universitas_id')}
        placeholder="Pilih universitas"
      />
      <Input
        label="Nama Resmi *"
        name="nama_resmi"
        value={values.nama_resmi || ''}
        onChange={set('nama_resmi')}
        required
      />
      <Input
        label="Nama Singkat"
        name="nama_singkat"
        value={values.nama_singkat || ''}
        onChange={set('nama_singkat')}
      />
    </div>
  );
};

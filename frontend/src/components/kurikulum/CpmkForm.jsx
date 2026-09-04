import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ScpPicker } from './ScpPicker';

export const CpmkForm = ({
  values,
  onChange,
  showScp = false,
  showHasSub = false,
  scpRequired = false,
  kurikulumId,
}) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  const hasSub = Boolean(values.has_sub);

  return (
    <div className="space-y-3">
      <Input
        label="Nama *"
        value={values.nama_cpmk || ''}
        onChange={set('nama_cpmk')}
        placeholder={showHasSub ? 'CPMK 1' : 'Sub-CPMK 1'}
        required
      />
      <Textarea label="Deskripsi" value={values.deskripsi || ''} onChange={set('deskripsi')} />
      {showHasSub && (
        <fieldset className="fieldset p-0 gap-1">
          <legend className="fieldset-legend text-xs font-medium text-base-content/80">
            Punya Sub-CPMK? *
          </legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                className="radio radio-sm radio-primary"
                name="has_sub"
                checked={!hasSub}
                onChange={() => onChange({ ...values, has_sub: false })}
              />
              Tidak, petakan langsung ke SCP
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                className="radio radio-sm radio-primary"
                name="has_sub"
                checked={hasSub}
                onChange={() => onChange({ ...values, has_sub: true, scp_ids: values.scp_ids || [] })}
              />
              Ya, setiap Sub-CPMK akan dipetakan ke SCP
            </label>
          </div>
        </fieldset>
      )}
      {showScp && (
        <ScpPicker
          kurikulumId={kurikulumId}
          value={values.scp_ids || []}
          required={scpRequired}
          onChange={(scp_ids) => onChange({ ...values, scp_ids })}
        />
      )}
    </div>
  );
};

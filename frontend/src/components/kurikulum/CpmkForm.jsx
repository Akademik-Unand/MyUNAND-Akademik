import { useId } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { ScpPicker } from './ScpPicker';
import { SubCpmkFields } from './SubCpmkFields';
import { emptySubCpmk } from '../../helpers/cpmkForm';

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
  // Nama grup radio dibuat unik per instance, supaya pilihan di satu baris CPMK
  // tidak saling memengaruhi baris CPMK lain (bulk create).
  const radioName = useId();

  return (
    <div className="space-y-3">
      <Input
        label="Nama *"
        value={values.nama_cpmk || ''}
        onChange={set('nama_cpmk')}
        placeholder={showHasSub ? 'CPMK 1' : 'Sub-CPMK 1'}
        required
      />
      <Textarea label="Deskripsi *" value={values.deskripsi || ''} onChange={set('deskripsi')} required />
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
                name={radioName}
                checked={!hasSub}
                onChange={() => onChange({ ...values, has_sub: false, sub_cpmk: [] })}
              />
              Tidak, petakan langsung ke SCP
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                className="radio radio-sm radio-primary"
                name={radioName}
                checked={hasSub}
                onChange={() =>
                  onChange({
                    ...values,
                    has_sub: true,
                    scp_ids: [],
                    sub_cpmk: values.sub_cpmk?.length ? values.sub_cpmk : [emptySubCpmk()],
                  })
                }
              />
              Ya, setiap Sub-CPMK akan dipetakan ke SCP
            </label>
          </div>
        </fieldset>
      )}
      {showHasSub && hasSub && (
        <SubCpmkFields
          items={values.sub_cpmk || []}
          kurikulumId={kurikulumId}
          onChange={(sub_cpmk) => onChange({ ...values, sub_cpmk })}
        />
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

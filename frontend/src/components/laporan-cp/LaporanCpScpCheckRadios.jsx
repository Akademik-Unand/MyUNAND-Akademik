import { useState } from 'react';
import { activeCheckActionKey, applyMatchingInGroup, buildCheckActions } from '../../helpers/laporanCp';

const matchesAction = (selected, groupRows, action) => {
  if (!action) return false;
  const matchIds = groupRows.filter(action.match).map((row) => row.id);
  const selectedIds = groupRows.filter((row) => selected.has(row.id)).map((row) => row.id);
  return matchIds.length > 0 && matchIds.length === selectedIds.length && matchIds.every((id) => selected.has(id));
};

export const LaporanCpScpCheckRadios = ({ groupRows, selected, onChange }) => {
  const actions = buildCheckActions(groupRows);
  const derived = activeCheckActionKey(selected, groupRows, actions);
  const [pickedKey, setPickedKey] = useState(null);
  const pickedAction = actions.find((action) => action.key === pickedKey);
  const active = matchesAction(selected, groupRows, pickedAction) ? pickedKey : derived;
  const first = groupRows[0];
  const name = `scp-check-${first?.cp_id || ''}-${first?.scp_id || 'group'}`;

  return (
    <fieldset className="mt-2 space-y-1">
      <legend className="sr-only">Pilih mata kuliah pada SCP ini</legend>
      {actions.map((action) => (
        <label key={action.key} className="flex cursor-pointer items-start gap-2 text-xs">
          <input
            type="radio"
            name={name}
            className="radio radio-sm radio-primary mt-0.5"
            checked={active === action.key}
            onChange={() => {
              setPickedKey(action.key);
              onChange(applyMatchingInGroup(selected, groupRows, action.match));
            }}
          />
          <span className="whitespace-normal">{action.label}</span>
        </label>
      ))}
    </fieldset>
  );
};

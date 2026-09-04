import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

export const FilterBar = ({
  fields = [],
  className = '',
  onApply,
  onReset,
  applyLabel = 'Terapkan',
  resetLabel = 'Reset',
  applyDisabled = false,
}) => {
  return (
    <div className={`flex flex-wrap items-end gap-2 ${className}`}>
      {fields.map((field) => (
        <Select
          key={field.name || field.label}
          size="sm"
          className="min-w-[11rem] flex-1"
          label={field.label}
          placeholder={field.placeholder}
          options={field.options || []}
          value={field.value}
          defaultValue={field.value === undefined ? '' : undefined}
          onChange={field.onChange}
          disabled={field.disabled}
        />
      ))}
      {(onApply || onReset) && (
        <div className="flex shrink-0 flex-wrap gap-2 pb-0.5">
          {onReset && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              {resetLabel}
            </Button>
          )}
          {onApply && (
            <Button size="sm" onClick={onApply} disabled={applyDisabled}>
              {applyLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

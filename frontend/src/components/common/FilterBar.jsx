import { Select } from '../ui/Select';

export const FilterBar = ({ fields = [], className = '' }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end ${className}`}>
      {fields.map((field) => (
        <Select
          key={field.label}
          size="sm"
          label={field.label}
          placeholder={field.placeholder}
          options={field.options || []}
          value={field.value}
          defaultValue={field.value === undefined ? '' : undefined}
          onChange={field.onChange}
        />
      ))}
    </div>
  );
};

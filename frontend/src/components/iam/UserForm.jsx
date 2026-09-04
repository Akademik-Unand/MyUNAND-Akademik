import { Input } from '../ui/Input';
import { useResourceQuery } from '../../hooks/useResourceQuery';

export const UserForm = ({ values, onChange }) => {
  const { data: roles = [] } = useResourceQuery('roles');

  const set = (key) => (event) => onChange({ ...values, [key]: event.target.value });
  const selected = values.roleIds || values.roles?.map((role) => role.id) || [];

  const toggleRole = (id) => {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
    onChange({ ...values, roleIds: next });
  };

  return (
    <div className="space-y-3">
      <Input label="Nama *" name="name" value={values.name || ''} onChange={set('name')} required />
      <Input label="Email *" name="email" type="email" value={values.email || ''} onChange={set('email')} required />
      <Input
        label={values.id ? 'Kata sandi (opsional)' : 'Kata sandi *'}
        name="password"
        type="password"
        value={values.password || ''}
        onChange={set('password')}
        required={!values.id}
      />
      <fieldset className="fieldset">
        <legend className="text-xs font-medium text-base-content/80">Peran</legend>
        <div className="mt-1 space-y-1">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selected.includes(role.id)}
                onChange={() => toggleRole(role.id)}
              />
              {role.name}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

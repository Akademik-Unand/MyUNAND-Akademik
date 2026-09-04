import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { updateProfile } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { roleLabel } from '../../constants/roles';

export const ProfileAccountForm = ({ user }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError('');
    if (!name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const saved = await updateProfile({ name: name.trim() });
      setUser(saved);
      toast.success('Profil disimpan');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <Input label="Nama" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      <Input label="Email" type="email" value={user?.email || ''} disabled />
      <Input
        label="Peran"
        value={(user?.roles || []).map((role) => roleLabel(role.name)).join(', ') || roleLabel(user?.role) || '—'}
        disabled
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex justify-end pt-1">
        <Button type="submit" size="sm" isLoading={saving}>
          Simpan
        </Button>
      </div>
    </form>
  );
};

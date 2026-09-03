import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { updateProfile } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export const ProfileAccountForm = ({ user }) => {
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    faculty: user?.faculty || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim()) {
      setError('Nama dan email wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const saved = await updateProfile({
        ...user,
        name: form.name.trim(),
        email: form.email.trim(),
        faculty: form.faculty.trim(),
      });
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
      <Input label="Nama" value={form.name} onChange={setField('name')} autoComplete="name" />
      <Input label="Email" type="email" value={form.email} onChange={setField('email')} autoComplete="email" />
      <Input label="Unit / fakultas" value={form.faculty} onChange={setField('faculty')} />
      <Input label="Peran" value={user?.role || '—'} disabled />
      <Input label="Universitas" value={user?.university || '—'} disabled />
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex justify-end pt-1">
        <Button type="submit" size="sm" isLoading={saving}>
          Simpan
        </Button>
      </div>
    </form>
  );
};

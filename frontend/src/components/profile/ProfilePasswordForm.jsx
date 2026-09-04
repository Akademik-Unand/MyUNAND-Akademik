import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { changePassword } from '../../services/api';

const empty = { currentPassword: '', newPassword: '', confirmPassword: '' };

export const ProfilePasswordForm = () => {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setError('');
    setSaving(true);
    try {
      await changePassword(form);
      setForm(empty);
      toast.success('Kata sandi diperbarui');
    } catch (err) {
      setError(err.message || 'Gagal mengubah kata sandi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <Input
        label="Kata sandi saat ini"
        type="password"
        autoComplete="current-password"
        value={form.currentPassword}
        onChange={setField('currentPassword')}
      />
      <Input
        label="Kata sandi baru"
        type="password"
        autoComplete="new-password"
        value={form.newPassword}
        onChange={setField('newPassword')}
      />
      <Input
        label="Ulangi kata sandi baru"
        type="password"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={setField('confirmPassword')}
      />
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex justify-end pt-1">
        <Button type="submit" size="sm" isLoading={saving}>
          Ubah kata sandi
        </Button>
      </div>
    </form>
  );
};

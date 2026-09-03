import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { loginWithPassword, loginWithSso } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const nextPath = location.state?.from || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');

  const finish = (result) => {
    login(result.user, result.access_token);
    navigate(nextPath, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Username dan kata sandi wajib diisi.');
      return;
    }

    setPending('password');
    try {
      const result = await loginWithPassword({ username: username.trim(), password });
      finish(result);
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa username dan kata sandi.');
    } finally {
      setPending('');
    }
  };

  const handleSso = async () => {
    setError('');
    setPending('sso');
    try {
      const result = await loginWithSso();
      finish(result);
    } catch (err) {
      toast.error(err.message || 'SSO belum dapat digunakan.');
    } finally {
      setPending('');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <Input
        label="Username"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-base-content/80">Kata sandi</span>
          <button
            type="button"
            className="text-xs text-base-content/60 hover:text-base-content"
            onClick={() => setShowPassword((open) => !open)}
          >
            {showPassword ? 'Sembunyikan' : 'Tampilkan'}
          </button>
        </div>
        <Input
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <Button type="submit" className="w-full" isLoading={pending === 'password'} disabled={Boolean(pending)}>
        Masuk
      </Button>

      <div className="divider text-xs text-base-content/50 my-2">atau</div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleSso}
        isLoading={pending === 'sso'}
        disabled={Boolean(pending)}
      >
        Masuk dengan SSO Unand
      </Button>
    </form>
  );
};

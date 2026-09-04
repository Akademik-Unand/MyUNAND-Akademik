import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { loginWithPassword } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const nextPath = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const lockRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockRef.current || pending) return;
    setError('');
    if (!email.trim() || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    lockRef.current = true;
    setPending(true);
    try {
      const result = await loginWithPassword({ email: email.trim(), password });
      login(result.user, result.access_token, result.refresh_token);
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Gagal masuk. Periksa email dan kata sandi.');
    } finally {
      lockRef.current = false;
      setPending(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

      <Button type="submit" className="w-full" isLoading={pending} disabled={pending}>
        Masuk
      </Button>

      <div className="divider text-xs text-base-content/50 my-2">atau</div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => toast.error('SSO Unand belum tersedia.')}
        disabled={pending}
      >
        Masuk dengan SSO Unand
      </Button>
    </form>
  );
};

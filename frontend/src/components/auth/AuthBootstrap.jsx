import { useEffect } from 'react';
import { getCurrentUser } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export const AuthBootstrap = () => {
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!token && !refreshToken) return undefined;
    getCurrentUser().then(setUser).catch(() => {});
    return undefined;
  }, [token, refreshToken, setUser]);

  return null;
};

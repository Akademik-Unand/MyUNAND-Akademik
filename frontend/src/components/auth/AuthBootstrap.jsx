import { useEffect } from 'react';
import { getCurrentUser } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';

export const AuthBootstrap = () => {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (!token) return undefined;
    getCurrentUser().then(setUser).catch(() => {});
    return undefined;
  }, [token, setUser]);

  return null;
};

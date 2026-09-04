import { useMemo } from 'react';
import { useAuthStore } from '../store/auth.store';
import { computeOrgScope } from '../helpers/orgScope';

export const useOrgScope = () => {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => computeOrgScope(user), [user]);
};
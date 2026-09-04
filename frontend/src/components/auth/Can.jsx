import { useAuthStore } from '../../store/auth.store';
import { can } from '../../policies/defineAbility';

/**
 * @param {{ I: string, a: string, children: import('react').ReactNode }} props
 */
export const Can = ({ I, a, children }) => {
  const user = useAuthStore((state) => state.user);
  if (!can(user, I, a)) return null;
  return children;
};

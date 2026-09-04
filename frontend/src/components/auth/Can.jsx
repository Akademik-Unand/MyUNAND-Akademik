import { useAuthStore } from '../../store/auth.store';
import { can } from '../../policies/defineAbility';

/**
 * @param {{ I?: string, a?: string, any?: { I: string, a: string }[], children: import('react').ReactNode }} props
 */
export const Can = ({ I, a, any, children }) => {
  const user = useAuthStore((state) => state.user);
  const allowed = any?.length
    ? any.some((rule) => can(user, rule.I, rule.a))
    : can(user, I, a);
  if (!allowed) return null;
  return children;
};

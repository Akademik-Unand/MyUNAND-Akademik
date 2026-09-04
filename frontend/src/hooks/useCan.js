import { useAuthStore } from '../store/auth.store';
import { can } from '../policies/defineAbility';

export const useCan = () => {
  const user = useAuthStore((state) => state.user);
  return (action, subject) => can(user, action, subject);
};

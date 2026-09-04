import { useAuthStore } from '../store/auth.store';
import { can } from '../policies/defineAbility';
import { ForbiddenPage } from '../pages/ForbiddenPage';

/**
 * Blokir halaman jika user tidak punya aksi pada subject.
 * Tanpa izin: tampilkan 403, jangan render children.
 */
export const PermissionRoute = ({ I, a, any, children }) => {
  const user = useAuthStore((state) => state.user);
  const allowed = any?.length
    ? any.some((rule) => can(user, rule.I, rule.a))
    : can(user, I, a);

  if (!allowed) {
    return <ForbiddenPage />;
  }

  return children;
};

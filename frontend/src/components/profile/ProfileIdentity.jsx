import { getInitials } from '../../utils/initials';
import { roleLabel } from '../../constants/roles';

export const ProfileIdentity = ({ user }) => {
  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="avatar avatar-placeholder">
        <div className="w-16 rounded-full bg-primary text-primary-content text-xl">
          <span>{getInitials(user.name)}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-lg font-medium text-base-content truncate">{user.name}</p>
        <p className="text-sm text-base-content/70 truncate">{user.email}</p>
        <p className="mt-1 text-sm text-base-content/60">
          {(user.roles || []).map((role) => roleLabel(role.name)).join(', ') || roleLabel(user.role)}
          {user.faculty ? ` · ${user.faculty}` : ''}
        </p>
      </div>
    </div>
  );
};

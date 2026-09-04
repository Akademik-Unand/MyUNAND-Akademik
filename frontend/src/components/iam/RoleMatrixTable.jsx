import { Fragment } from 'react';

export const RoleMatrixTable = ({ roles, groups, draft, onToggle, readOnly = false }) => {
  if (!roles.length) {
    return <p className="p-4 text-sm text-base-content/60">Belum ada peran untuk diatur.</p>;
  }

  if (!Object.keys(groups).length) {
    return <p className="p-4 text-sm text-base-content/60">Tidak ada permission yang cocok.</p>;
  }

  return (
    <table className="table table-sm">
      <thead>
        <tr>
          <th>Permission</th>
          {roles.map((role) => (
            <th key={role.id} className="text-center">{role.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(groups).map(([group, permissions]) => (
          <Fragment key={group}>
            <tr>
              <td colSpan={roles.length + 1} className="font-medium bg-base-200">{group}</td>
            </tr>
            {permissions.map((permission) => (
              <tr key={permission.id}>
                <td>
                  <div className="font-mono text-xs">{permission.name}</div>
                  <div className="text-xs text-base-content/60">{permission.description}</div>
                </td>
                {roles.map((role) => (
                  <td key={`${role.id}-${permission.id}`} className="text-center">
                    {readOnly ? (
                      <span className="text-sm">
                        {(draft[role.id] || []).includes(permission.id) ? 'Ya' : '—'}
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={(draft[role.id] || []).includes(permission.id)}
                        onChange={() => onToggle(role.id, permission.id)}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
};

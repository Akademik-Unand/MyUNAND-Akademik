import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { RoleMatrixTable } from '../../components/iam/RoleMatrixTable';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getRolePermissionMatrix, syncRolePermissions } from '../../services/api';
import { useBusyAction } from '../../hooks/useBusyAction';

const matchesQuery = (permission, query) => {
  const haystack = [permission.name, permission.description, permission.group, permission.subject]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
};

export const RoleMatrixPage = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['roles', 'matrix'],
    queryFn: getRolePermissionMatrix,
  });
  const [draft, setDraft] = useState({});
  const [search, setSearch] = useState('');
  const { busy, run } = useBusyAction();

  useEffect(() => {
    if (data?.grants) setDraft(data.grants);
  }, [data]);

  useEffect(() => {
    if (error) toast.error(error.message || 'Gagal memuat matriks');
  }, [error]);

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();
    const map = {};
    for (const permission of data?.permissions || []) {
      if (query && !matchesQuery(permission, query)) continue;
      const group = permission.group || 'lainnya';
      if (!map[group]) map[group] = [];
      map[group].push(permission);
    }
    return map;
  }, [data?.permissions, search]);

  const toggle = (roleId, permissionId) => {
    setDraft((current) => {
      const selected = new Set(current[roleId] || []);
      if (selected.has(permissionId)) selected.delete(permissionId);
      else selected.add(permissionId);
      return { ...current, [roleId]: [...selected] };
    });
  };

  const saveRole = (role) =>
    run(async () => {
      await syncRolePermissions(role.id, draft[role.id] || []);
      toast.success(`Permission ${role.name} tersimpan.`);
      await refetch();
    });

  const roles = (data?.roles || []).filter((role) => role.name !== 'superadmin');

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Peran & Permission"
        subtitle="Centang aksi yang boleh dilakukan tiap peran. Superadmin selalu punya semua akses."
        breadcrumbs={[{ label: 'Pengguna & Akses' }, { label: 'Peran' }]}
      />
      <Card className="overflow-x-auto">
        {roles.length > 0 && (
          <div className="p-4 pb-0">
            <label className="input input-sm w-full sm:max-w-xs">
              <Search size={15} className="opacity-50" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari permission, subject, atau grup..."
                aria-label="Cari permission"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Bersihkan pencarian">
                  <X size={14} className="opacity-50" />
                </button>
              )}
            </label>
          </div>
        )}
        <RoleMatrixTable roles={roles} groups={groups} draft={draft} onToggle={toggle} />
        {roles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 border-t border-base-300">
            {roles.map((role) => (
              <Button key={role.id} size="sm" onClick={() => saveRole(role)} isLoading={Boolean(busy)} disabled={Boolean(busy)}>
                Simpan {role.name}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

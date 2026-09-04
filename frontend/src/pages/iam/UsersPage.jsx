import { MasterListPage } from '../../components/master/MasterListPage';
import { UserForm } from '../../components/iam/UserForm';
import { assignUserRoles } from '../../services/api';

export const UsersPage = () => (
  <MasterListPage
    title="Pengguna"
    subtitle="Kelola akun dan tetapkan lebih dari satu peran"
    breadcrumbs={[{ label: 'Pengguna & Akses' }, { label: 'Pengguna' }]}
    resource="users"
    idKey="id"
    FormComponent={UserForm}
    emptyForm={{ name: '', email: '', password: '', roleIds: [] }}
    afterSave={async (saved, values) => {
      const roleIds = values.roleIds || (values.roles || []).map((role) => role.id);
      if (saved?.id) await assignUserRoles(saved.id, roleIds);
    }}
    rowKey={(row) => row.id}
    searchPlaceholder="Cari nama atau email..."
    columns={[
      { key: 'name', header: 'Nama', sortable: true },
      { key: 'email', header: 'Email', sortable: true },
      {
        key: 'roles',
        header: 'Peran',
        render: (row) => (row.roles || []).map((role) => role.name).join(', ') || row.role || '—',
      },
    ]}
    detailItems={(row) => [
      { label: 'Nama', value: row.name },
      { label: 'Email', value: row.email },
      { label: 'Peran', value: (row.roles || []).map((role) => role.name).join(', ') || row.role },
    ]}
  />
);

import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { ProfileIdentity } from '../components/profile/ProfileIdentity';
import { ProfileAccountForm } from '../components/profile/ProfileAccountForm';
import { ProfilePasswordForm } from '../components/profile/ProfilePasswordForm';
import { useAuthStore } from '../store/auth.store';

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil"
        subtitle="Data akun yang dipakai di sistem kurikulum"
        breadcrumbs={[{ label: 'Profil' }]}
      />

      <Card>
        <ProfileIdentity user={user} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Data akun">
          <ProfileAccountForm user={user} />
        </Card>
        <Card title="Kata sandi" subtitle="Minimal 6 karakter">
          <ProfilePasswordForm />
        </Card>
      </div>
    </div>
  );
};

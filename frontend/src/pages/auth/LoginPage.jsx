import { AuthLayout } from '../../layouts/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export const LoginPage = () => {
  return (
    <AuthLayout>
      <div className="rounded-box border border-base-300 bg-base-100 p-6">
        <img src="/images/myunand.png" alt="myUNAND" className="mx-auto mb-5 h-10 w-auto object-contain" />
        <h1 className="text-lg font-medium text-base-content">Masuk</h1>
        <p className="mb-5 mt-1 text-sm text-base-content/60">Kurikulum Universitas Andalas</p>
        <LoginForm />
      </div>
    </AuthLayout>
  );
};

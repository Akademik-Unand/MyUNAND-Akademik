import { AccessibilityMenu } from './AccessibilityMenu';

export const AuthLayout = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-base-200 text-base-content">
      <div className="absolute right-4 top-4">
        <AccessibilityMenu />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <p className="px-4 pb-6 text-center text-xs text-base-content/60">
        Universitas Andalas — Sistem Informasi Kurikulum
      </p>
    </div>
  );
};

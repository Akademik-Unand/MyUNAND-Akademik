import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldX } from 'lucide-react';

export const ForbiddenPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="text-6xl font-black text-error">403</div>
      <h2 className="text-xl font-bold text-base-content">Akses Ditolak</h2>
      <p className="text-xs text-base-content/60 max-w-sm">
        Anda tidak memiliki izin untuk membuka halaman ini.
      </p>
      <Link to="/">
        <Button variant="primary" size="sm" className="gap-2">
          <ShieldX size={16} /> Ke Dashboard
        </Button>
      </Link>
    </div>
  );
};

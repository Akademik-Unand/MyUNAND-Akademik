import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="text-6xl font-black text-primary">404</div>
      <h2 className="text-xl font-bold text-base-content">Halaman Tidak Ditemukan</h2>
      <p className="text-xs text-base-content/60 max-w-sm">
        Halaman yang Anda tuju mungkin telah dipindahkan atau belum tersedia.
      </p>
      <Link to="/">
        <Button variant="primary" size="sm" className="gap-2">
          <Home size={16} /> Ke Dashboard
        </Button>
      </Link>
    </div>
  );
};

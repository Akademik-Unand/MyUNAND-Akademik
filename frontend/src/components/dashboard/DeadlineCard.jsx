import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AlertCircle } from 'lucide-react';

export const DeadlineCard = () => {
  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Semester Aktif</Badge>
            <span className="text-xs text-base-content/60">TA 2024/2025</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-base-content">Semester Genap 2024</h2>
          <p className="text-xs md:text-sm text-base-content/70">
            Portal Akademik & Kurikulum Berbasis Outcome (OBE)
          </p>
        </div>

        <div className="space-y-1.5 md:text-right">
          <p className="text-xs font-semibold text-base-content/70">
            Batas Akhir Input Nilai & Evaluasi CPMK
          </p>
          <p className="text-sm font-bold text-base-content">30 Juni 2024, 23:59 WIB</p>
          <Badge variant="error" outline>
            <AlertCircle size={12} className="mr-1" />
            Masih ada 8 jam lagi
          </Badge>
        </div>
      </div>
    </Card>
  );
};

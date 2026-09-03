import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AlertCircle, CalendarClock } from 'lucide-react';

export const DeadlineCard = () => {
  return (
    <Card className="h-full">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">Semester Aktif</Badge>
            <span className="text-xs text-base-content/60">TA 2024/2025</span>
          </div>
          <h2 className="text-lg font-bold text-base-content md:text-xl">Semester Genap 2024</h2>
          <p className="text-xs text-base-content/70 md:text-sm">
            Portal Akademik &amp; Kurikulum Berbasis Outcome (OBE)
          </p>
        </div>

        <div className="border-t border-base-200 pt-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-200 text-base-content/60">
              <CalendarClock size={18} />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold text-base-content/70">
                Batas Akhir Input Nilai &amp; Evaluasi CPMK
              </p>
              <p className="text-sm font-bold text-base-content">30 Juni 2024, 23:59 WIB</p>
              <Badge variant="error" outline>
                <AlertCircle size={12} className="mr-1" />
                Masih ada 8 jam lagi
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

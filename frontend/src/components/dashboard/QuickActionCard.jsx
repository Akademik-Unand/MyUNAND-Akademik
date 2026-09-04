import { Download, FileText, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const QuickActionCard = () => (
  <Card className="h-full bg-base-100">
    <div className="flex flex-col justify-between h-full gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-base-200 text-base-content/60 flex items-center justify-center shrink-0">
          <FileText size={18} />
        </div>
        <div>
          <h4 className="font-medium text-sm md:text-base text-base-content">
            Panduan Portal Kurikulum
          </h4>
          <p className="text-xs text-base-content/70 mt-1 leading-relaxed">
            Unduh buku panduan penggunaan aplikasi portal teknik & kurikulum Unand untuk Dosen dan Koordinator Program Studi.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-base-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-base-content/60">
          <HelpCircle size={14} />
          <span>Versi Dokumen: v2.4 (Terbaru)</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 font-semibold"
          onClick={() => toast.info('Berkas panduan belum tersedia.')}
        >
          <Download size={15} />
          <span>Download Manual</span>
        </Button>
      </div>
    </div>
  </Card>
);

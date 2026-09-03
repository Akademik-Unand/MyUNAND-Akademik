import Chart from 'react-apexcharts';
import { Card } from '../ui/Card';
import { Users, Clock } from 'lucide-react';
import { radialProgressOptions } from '../../helpers/dashboardChart';

const STATUS = [
  { label: 'Total CPMK', value: 144, tone: 'info' },
  { label: 'Selesai', value: 86, tone: 'error' },
  { label: 'In Progress', value: 42, tone: 'success' },
  { label: 'Menunggu', value: 16, tone: 'warning' },
];

export const ProjectProgressCard = () => {
  const percent = 78;
  const options = radialProgressOptions(percent);

  return (
    <Card
      title="Tim Pengembang Kurikulum"
      subtitle="Fakultas Teknik Unand"
      actions={
        <div className="badge badge-ghost badge-sm">
          <Users size={13} className="mr-1" />
          Capaian {percent}%
        </div>
      }
    >
      <Chart options={options} series={[percent]} type="radialBar" height={200} />

      <div className="grid grid-cols-2 gap-3 mt-1">
        {STATUS.map((s) => (
          <div key={s.label} className={`rounded-md border-l-4 bg-base-200 p-3 ${
            s.tone === 'info' ? 'border-info' : s.tone === 'error' ? 'border-error' : s.tone === 'success' ? 'border-success' : 'border-warning'
          }`}>
            <p className="text-[11px] uppercase text-base-content/60">{s.label}</p>
            <p className="text-xl font-semibold text-base-content mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-base-200 space-y-2">
        <div className="flex items-center gap-3 py-1.5">
          <div className="text-base-content/50">
            <Clock size={16} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-base-content/60">Rapat Pleno Kurikulum</p>
            <p className="text-xs font-semibold text-base-content">Senin, 08:00 - 11:00 WIB</p>
          </div>
          <span className="badge badge-ghost">Ruang Sidang</span>
        </div>
        <div className="flex items-center gap-3 py-1.5">
          <div className="text-base-content/50">
            <Clock size={16} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-base-content/60">Pengingat Verifikasi</p>
            <p className="text-xs font-semibold text-base-content">Batas Verifikasi Portofolio</p>
          </div>
          <span className="badge badge-warning">Penting</span>
        </div>
      </div>
    </Card>
  );
};

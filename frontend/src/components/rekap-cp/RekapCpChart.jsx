import Chart from 'react-apexcharts';
import { rekapCpChartOptions, rekapCpChartSeries } from '../../helpers/rekapCpChart';
import { Skeleton } from '../ui/Skeleton';

export const RekapCpChart = ({ rows = [], isPending = false }) => {
  if (isPending) return <Skeleton className="h-80 w-full" />;
  if (!rows.length) {
    return <p className="text-sm text-base-content/60">Belum ada data grafik untuk filter ini.</p>;
  }

  return (
    <div>
      <h4 className="font-medium mb-1">Capaian Target CPMK dalam Grafik</h4>
      <p className="text-xs text-base-content/60 mb-3">Persen Ketercapaian</p>
      <Chart
        type="line"
        height={380}
        options={rekapCpChartOptions(rows.map((row) => row.label))}
        series={rekapCpChartSeries(rows)}
      />
    </div>
  );
};

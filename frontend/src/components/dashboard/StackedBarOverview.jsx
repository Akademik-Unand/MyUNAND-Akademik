import Chart from 'react-apexcharts';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { stackedDepartmentOptions, stackedDepartmentSeries } from '../../helpers/dashboardChart';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../../services/api';

export const StackedBarOverview = () => {
  const { data } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
  });

  const categories = ['Mahasiswa', 'Dosen', 'Matakuliah', 'Kelas'];
  const counts = [data?.mahasiswa || 0, data?.dosen || 0, data?.matakuliah || 0, data?.kelas || 0];
  const hasData = counts.some((value) => value > 0);
  const series = hasData
    ? stackedDepartmentSeries(
        categories.map((name, idx) => ({
          name,
          completed: counts[idx],
          inProgress: 0,
          pending: 0,
        }))
      )
    : stackedDepartmentSeries([]);
  const options = stackedDepartmentOptions(hasData ? categories : []);

  return (
    <Card
      title="Ringkasan Data Sistem"
      subtitle="Jumlah entitas aktif dari API, menunggu rekap capaian sungguhan"
      actions={
        <Badge variant="outline" size="sm">
          Live
        </Badge>
      }
    >
      {hasData ? (
        <Chart options={options} series={series} type="bar" height={260} />
      ) : (
        <p className="text-sm text-base-content/60">Belum ada data ringkasan untuk ditampilkan.</p>
      )}
    </Card>
  );
};

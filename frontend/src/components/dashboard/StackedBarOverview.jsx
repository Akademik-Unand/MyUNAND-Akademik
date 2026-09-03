import Chart from 'react-apexcharts';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { stackedDepartmentOptions, stackedDepartmentSeries } from '../../helpers/dashboardChart';

const DEPARTMENTS_DATA = [
  { name: 'Elektro', full: 'Departemen Teknik Elektro', completed: 88, inProgress: 10, pending: 2 },
  { name: 'Mesin', full: 'Departemen Teknik Mesin', completed: 75, inProgress: 18, pending: 7 },
  { name: 'Industri', full: 'Departemen Teknik Industri', completed: 92, inProgress: 6, pending: 2 },
  { name: 'Sipil', full: 'Departemen Teknik Sipil', completed: 70, inProgress: 22, pending: 8 },
  { name: 'Informatika', full: 'Departemen Teknologi Informasi', completed: 95, inProgress: 4, pending: 1 },
];

export const StackedBarOverview = () => {
  const categories = DEPARTMENTS_DATA.map((d) => d.name);
  const options = stackedDepartmentOptions(categories);
  const series = stackedDepartmentSeries(DEPARTMENTS_DATA);

  return (
    <Card
      title="Progres Pemenuhan CPMK & Nilai per Departemen"
      subtitle="Evaluasi capaian pembelajaran mata kuliah semester berjalan"
      actions={
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-base-content/70">
              <span className="w-2.5 h-2.5 rounded-full bg-success"></span> Selesai (&ge;80%)
            </span>
            <span className="flex items-center gap-1.5 text-base-content/70">
              <span className="w-2.5 h-2.5 rounded-full bg-warning"></span> Review
            </span>
            <span className="flex items-center gap-1.5 text-base-content/70">
              <span className="w-2.5 h-2.5 rounded-full bg-error"></span> Belum Lengkap
            </span>
          </div>
          <Badge variant="outline" size="sm">
            5 Departemen
          </Badge>
        </div>
      }
    >
      <Chart options={options} series={series} type="bar" height={260} />
    </Card>
  );
};

import Chart from 'react-apexcharts';
import { laporanCpGrafikOptions, laporanCpGrafikSeries } from '../../helpers/laporanCpMatakuliah';

export const LaporanCpGrafikTab = ({ evaluasi = [] }) => {
  if (!evaluasi.length) {
    return <p className="text-sm text-base-content/60">Belum ada data evaluasi untuk digambarkan.</p>;
  }

  const categories = evaluasi.map((row) => row.cpmk_nama || row.cpmk_id);

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">Capaian Target CPMK dalam Grafik</h3>
      <Chart options={laporanCpGrafikOptions(categories)} series={laporanCpGrafikSeries(evaluasi)} type="bar" height={320} />
    </div>
  );
};
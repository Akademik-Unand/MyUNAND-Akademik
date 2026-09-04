export const sumberLabel = (item) => {
  const bobot = item?.bobot;
  if (bobot === null || bobot === undefined || bobot === '') return item?.nama || '';
  return `${item.nama} ${bobot}`;
};

export const laporanCpGrafikSeries = (rows = []) => [
  {
    name: 'Target',
    data: rows.map((row) => (row.target_persen_lulus == null ? 0 : Number(row.target_persen_lulus))),
  },
  {
    name: 'Capaian',
    data: rows.map((row) => (row.capaian_persen == null ? 0 : Number(row.capaian_persen))),
  },
];

export const laporanCpGrafikOptions = (categories = []) => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: "'DM Sans', system-ui, sans-serif",
    foreColor: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)',
  },
  plotOptions: { bar: { borderRadius: 2, columnWidth: '45%' } },
  colors: ['#94a3b8', '#15803d'],
  dataLabels: { enabled: true, formatter: (val) => `${val}%` },
  xaxis: { categories },
  yaxis: { max: 100, labels: { formatter: (val) => `${val}%` } },
  grid: { strokeDashArray: 4 },
  tooltip: { y: { formatter: (val) => `${val}%` } },
});
export const rekapCpChartSeries = (rows = []) => [
  { name: 'Capaian Kelulusan', type: 'column', data: rows.map((row) => Number(row.capaian) || 0) },
  { name: 'Target Kelulusan', type: 'line', data: rows.map((row) => Number(row.target) || 0) },
];

export const rekapCpChartOptions = (categories = []) => ({
  chart: {
    type: 'line',
    toolbar: { show: true },
    fontFamily: "'DM Sans', system-ui, sans-serif",
    foreColor: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)',
    zoom: { enabled: true },
  },
  stroke: { width: [0, 3] },
  plotOptions: { bar: { columnWidth: '45%', borderRadius: 2 } },
  colors: ['#2563eb', '#16a34a'],
  dataLabels: {
    enabled: true,
    enabledOnSeries: [1],
    formatter: (val) => `${val}`,
  },
  markers: { size: [0, 5] },
  xaxis: {
    categories,
    labels: { rotate: -45, hideOverlappingLabels: true },
  },
  yaxis: {
    min: 0,
    max: 100,
    title: { text: 'Persen' },
    labels: { formatter: (val) => `${val}` },
  },
  legend: { position: 'bottom' },
  grid: { strokeDashArray: 4 },
  tooltip: { y: { formatter: (val) => `${val}%` } },
});

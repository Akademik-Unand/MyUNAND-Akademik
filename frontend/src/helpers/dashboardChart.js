export const stackedDepartmentSeries = (departments) => [
  { name: 'Selesai', data: departments.map((d) => d.completed) },
  { name: 'Review', data: departments.map((d) => d.inProgress) },
  { name: 'Belum Lengkap', data: departments.map((d) => d.pending) },
];

export const stackedDepartmentOptions = (categories) => ({
  chart: {
    type: 'bar',
    stacked: true,
    stackType: '100%',
    toolbar: { show: false },
    fontFamily: "'DM Sans', system-ui, sans-serif",
    foreColor: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)',
    redrawOnParentResize: true,
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '70%',
      borderRadius: 2,
      borderRadiusApplication: 'end',
    },
  },
  colors: ['#16a34a', '#f59e0b', '#ef4444'],
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val}%`,
    style: { fontSize: '11px', fontWeight: 600, colors: ['#ffffff'] },
  },
  xaxis: {
    categories,
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { fontSize: '12px', fontWeight: 500 } },
  },
  grid: { show: false },
  legend: { show: false },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `${val}%` },
  },
  fill: { opacity: 1 },
  states: { hover: { filter: { type: 'none' } } },
});

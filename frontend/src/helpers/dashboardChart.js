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
    foreColor: 'hsl(var(--bc) / 0.7)',
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

export const radialProgressOptions = (percent) => ({
  chart: {
    type: 'radialBar',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    sparkline: { enabled: true },
  },
  colors: ['#16a34a'],
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: { size: '62%' },
      track: { background: 'hsl(var(--b3))', strokeWidth: '100%' },
      dataLabels: {
        name: { show: true, fontSize: '12px', offsetY: 18, color: 'hsl(var(--bc) / 0.6)' },
        value: { show: true, fontSize: '22px', fontWeight: 700, offsetY: -8, color: 'hsl(var(--bc))' },
      },
    },
  },
  labels: ['Capaian'],
  fill: {
    type: 'gradient',
    gradient: { shade: 'light', type: 'horizontal', gradientToColors: ['#86efac'], stops: [0, 100] },
  },
  seriesLabel: percent,
});

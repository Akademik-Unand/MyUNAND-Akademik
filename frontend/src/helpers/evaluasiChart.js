export const evaluasiCapaianSeries = (rows) => [
  { name: 'Capaian target', data: rows.map((row) => Number(String(row.capaianTarget).replace('%', ''))) },
];

export const evaluasiCapaianOptions = (categories) => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: "'DM Sans', system-ui, sans-serif",
    foreColor: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)',
  },
  plotOptions: { bar: { borderRadius: 2, columnWidth: '45%' } },
  colors: ['#15803d'],
  dataLabels: { enabled: true, formatter: (val) => `${val}%` },
  xaxis: { categories },
  yaxis: { max: 100, labels: { formatter: (val) => `${val}%` } },
  grid: { strokeDashArray: 4 },
  legend: { show: false },
  tooltip: { y: { formatter: (val) => `${val}%` } },
});

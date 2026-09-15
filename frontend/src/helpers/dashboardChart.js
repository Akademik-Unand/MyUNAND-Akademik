const baseChart = (type) => ({
  chart: { type, toolbar: { show: false }, fontFamily: "'DM Sans', system-ui, sans-serif" },
  colors: ["#16a34a", "#f59e0b", "#2563eb", "#ef4444"],
  dataLabels: { enabled: false },
  grid: { borderColor: "color-mix(in oklab, var(--color-base-content) 12%, transparent)" },
  tooltip: {
    enabled: true,
    theme: "dark",
    style: { fontSize: "12px", fontFamily: "'DM Sans', system-ui, sans-serif" },
  },
  noData: { text: "Belum ada data" },
});

export const countBarChart = (rows = [], valueKey = "jumlah") => ({
  series: [{ name: "Jumlah", data: rows.map((row) => Number(row[valueKey] || 0)) }],
  options: {
    ...baseChart("bar"),
    plotOptions: { bar: { horizontal: true, borderRadius: 2 } },
    xaxis: { categories: rows.map((row) => row.nama) },
    tooltip: {
      ...baseChart("bar").tooltip,
      y: { formatter: (value) => `${Number(value).toLocaleString("id-ID")} mahasiswa` },
    },
  },
});

export const cplBarChart = (rows = []) => ({
  series: [
    { name: "Capaian", data: rows.map((row) => Number(row.nilai || 0)) },
    { name: "Target", data: rows.map((row) => Number(row.target || 0)) },
  ],
  options: {
    ...baseChart("bar"),
    xaxis: { categories: rows.map((row) => row.nama), min: 0, max: 100 },
    yaxis: { min: 0, max: 100 },
  },
});

export const statusDonutChart = (rows = []) => ({
  series: rows.map((row) => Number(row.jumlah || 0)),
  options: {
    ...baseChart("donut"),
    labels: rows.map((row) => row.nama),
    legend: { position: "bottom" },
    tooltip: { ...baseChart("donut").tooltip, y: { formatter: (value) => Number(value).toLocaleString("id-ID") } },
  },
});

export const facultyTreemapChart = (rows = []) => ({
  series: [{
    name: "Mahasiswa",
    data: rows
      .filter((row) => Number(row.mahasiswa) > 0)
      .map((row) => ({ x: row.nama, y: Number(row.mahasiswa) })),
  }],
  options: {
    ...baseChart("treemap"),
    legend: { show: false },
    plotOptions: { treemap: { distributed: true, borderRadius: 2 } },
  },
});

export const trendLineChart = (rows = []) => ({
  series: [
    { name: "Mahasiswa Aktif", data: rows.map((row) => Number(row.mahasiswa_aktif || 0)) },
    { name: "Peserta KRS", data: rows.map((row) => Number(row.peserta_krs || 0)) },
  ],
  options: {
    ...baseChart("line"),
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 4 },
    legend: { position: "bottom" },
    xaxis: { categories: rows.map((row) => row.semester) },
    yaxis: { labels: { formatter: (value) => Math.round(value).toLocaleString("id-ID") } },
    tooltip: {
      ...baseChart("line").tooltip,
      shared: true,
      intersect: false,
      y: { formatter: (value) => Number(value).toLocaleString("id-ID") },
    },
  },
});

export const krsParticipationRadialChart = (rows = []) => {
  const total = rows.reduce((sum, row) => sum + Number(row.jumlah || 0), 0);
  const participants = rows
    .filter((row) => row.nama !== "Belum mengisi")
    .reduce((sum, row) => sum + Number(row.jumlah || 0), 0);
  const percentage = total ? Math.round((participants / total) * 100) : 0;
  return {
    series: [percentage],
    options: {
      ...baseChart("radialBar"),
      labels: ["Partisipasi KRS"],
      plotOptions: {
        radialBar: {
          hollow: { size: "62%" },
          dataLabels: { value: { formatter: (value) => `${Math.round(value)}%` } },
        },
      },
      tooltip: {
        ...baseChart("radialBar").tooltip,
        y: { formatter: (value) => `${Math.round(value)}% mahasiswa sudah mengisi KRS` },
      },
    },
  };
};

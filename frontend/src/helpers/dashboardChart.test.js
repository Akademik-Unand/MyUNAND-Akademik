import { describe, expect, it } from "vitest";
import {
  countBarChart,
  cplBarChart,
  facultyTreemapChart,
  krsParticipationRadialChart,
  statusDonutChart,
  trendLineChart,
} from "./dashboardChart";

describe("dashboardChart", () => {
  it("maps count rows to an absolute bar", () => {
    const chart = countBarChart([{ nama: "Teknik", mahasiswa: "12" }], "mahasiswa");
    expect(chart.series[0].data).toEqual([12]);
    expect(chart.options.xaxis.categories).toEqual(["Teknik"]);
  });

  it("keeps CPL value and target separate", () => {
    const chart = cplBarChart([{ nama: "CPL 1", nilai: 75, target: 60 }]);
    expect(chart.series.map((item) => item.data)).toEqual([[75], [60]]);
  });

  it("maps mutually exclusive status to donut", () => {
    expect(statusDonutChart([{ nama: "Menunggu", jumlah: 2 }]).series).toEqual([2]);
  });

  it("omits empty faculties from treemap", () => {
    const chart = facultyTreemapChart([
      { nama: "Teknologi Pertanian", mahasiswa: 557 },
      { nama: "Teknik", mahasiswa: 0 },
    ]);
    expect(chart.series[0].data).toEqual([{ x: "Teknologi Pertanian", y: 557 }]);
  });

  it("calculates KRS participation as a radial percentage", () => {
    const chart = krsParticipationRadialChart([
      { nama: "Disetujui", jumlah: 6 },
      { nama: "Menunggu", jumlah: 2 },
      { nama: "Belum mengisi", jumlah: 2 },
    ]);
    expect(chart.series).toEqual([80]);
  });

  it("maps semester history to line series", () => {
    const chart = trendLineChart([
      { semester: "2025/26 Ganjil", mahasiswa_aktif: 100, peserta_krs: 80 },
    ]);
    expect(chart.series.map((series) => series.data)).toEqual([[100], [80]]);
    expect(chart.options.xaxis.categories).toEqual(["2025/26 Ganjil"]);
  });
});

import { describe, expect, it } from "vitest";
import {
  programStudiLabel,
  semesterDanSebelumnyaLabel,
} from "./academicLabel";

describe("programStudiLabel", () => {
  it("uses nama_singkat and never falls back to nama_resmi", () => {
    expect(
      programStudiLabel({
        nama_singkat: "S1 TPB",
        nama_resmi: "Teknik Pertanian",
      }),
    ).toBe("S1 TPB");
    expect(
      programStudiLabel({
        kode_prodi: "80203",
        nama_resmi: "Teknik Pertanian",
      }),
    ).toBe("80203");
  });
});

describe("semesterDanSebelumnyaLabel", () => {
  it("appends dan sebelumnya", () => {
    expect(
      semesterDanSebelumnyaLabel({
        tahun: 2026,
        jenisSemester: { nama: "Genap" },
      }),
    ).toBe("Genap 2026/2027 dan sebelumnya");
  });
});

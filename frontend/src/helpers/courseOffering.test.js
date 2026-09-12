import { describe, expect, it } from "vitest";
import { buildBulkOfferingPayload, coursesForProgram } from "./courseOffering";

describe("course offering helpers", () => {
  it("limits courses to the selected owning program", () => {
    const rows = [
      { id: "a", program_studi_id: "p1" },
      { id: "b", programStudi: { id: "p2" } },
    ];
    expect(coursesForProgram(rows, "p2").map((row) => row.id)).toEqual(["b"]);
  });

  it("builds offering payload with unique courses", () => {
    expect(
      buildBulkOfferingPayload(
        {
          semester_id: "sem-1",
          program_studi_id: "p-1",
          kuota_lintas_prodi: "20",
          akses: "semua",
          prodi_tujuan: ["ignored"],
        },
        ["m1", "m1", "m2"],
      ),
    ).toEqual({
      semester_id: "sem-1",
      program_studi_id: "p-1",
      kuota_lintas_prodi_default: 20,
      akses: "semua",
      prodi_tujuan: [],
      matakuliah: [
        { matakuliah_id: "m1", kuota_lintas_prodi: 20 },
        { matakuliah_id: "m2", kuota_lintas_prodi: 20 },
      ],
    });
  });

  it("uses per-course quota overrides", () => {
    const payload = buildBulkOfferingPayload(
      {
        semester_id: "sem-1",
        program_studi_id: "p-1",
        kuota_lintas_prodi: "20",
        akses: "semua",
      },
      ["m1", "m2"],
      { m2: "7" },
    );

    expect(payload.matakuliah).toEqual([
      { matakuliah_id: "m1", kuota_lintas_prodi: 20 },
      { matakuliah_id: "m2", kuota_lintas_prodi: 7 },
    ]);
  });

  it("memaksa kuota lintas 0 untuk MK berprasyarat", () => {
    const payload = buildBulkOfferingPayload(
      {
        semester_id: "sem-1",
        program_studi_id: "p-1",
        kuota_lintas_prodi: "20",
        akses: "semua",
      },
      ["m1", "m2"],
      { m2: "9" },
      [
        { id: "m1", has_prasyarat: true },
        { id: "m2", has_prasyarat: false },
      ],
    );

    expect(payload.matakuliah).toEqual([
      { matakuliah_id: "m1", kuota_lintas_prodi: 0 },
      { matakuliah_id: "m2", kuota_lintas_prodi: 9 },
    ]);
  });
});

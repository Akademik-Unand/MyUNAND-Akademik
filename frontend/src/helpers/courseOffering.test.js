import { describe, expect, it } from "vitest";
import { activeOfferingProgramId, buildBulkOfferingPayload, coursesForProgram } from "./courseOffering";

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
          akses: "semua",
          prodi_tujuan: ["ignored"],
        },
        ["m1", "m1", "m2"],
      ),
    ).toEqual({
      semester_id: "sem-1",
      program_studi_id: "p-1",
      akses: "semua",
      prodi_tujuan: [],
      matakuliah: [
        { matakuliah_id: "m1", jumlah_peserta_max_default: 40, jumlah_peserta_internal_max_default: 40, kuota_lintas_prodi: 0 },
        { matakuliah_id: "m2", jumlah_peserta_max_default: 40, jumlah_peserta_internal_max_default: 40, kuota_lintas_prodi: 0 },
      ],
    });
  });

  it("uses per-course quota overrides", () => {
    const payload = buildBulkOfferingPayload(
      {
        semester_id: "sem-1",
        program_studi_id: "p-1",
        akses: "semua",
      },
      ["m1", "m2"],
      { m2: "7" },
    );

    expect(payload.matakuliah).toEqual([
      { matakuliah_id: "m1", jumlah_peserta_max_default: 40, jumlah_peserta_internal_max_default: 40, kuota_lintas_prodi: 0 },
      { matakuliah_id: "m2", jumlah_peserta_max_default: 47, jumlah_peserta_internal_max_default: 40, kuota_lintas_prodi: 7 },
    ]);
  });

  it("memaksa kuota lintas 0 untuk MK berprasyarat", () => {
    const payload = buildBulkOfferingPayload(
      {
        semester_id: "sem-1",
        program_studi_id: "p-1",
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
      { matakuliah_id: "m1", jumlah_peserta_max_default: 40, jumlah_peserta_internal_max_default: 40, kuota_lintas_prodi: 0 },
      { matakuliah_id: "m2", jumlah_peserta_max_default: 49, jumlah_peserta_internal_max_default: 40, kuota_lintas_prodi: 9 },
    ]);
  });

  it("defaults new offerings to internal-only and clears cross quotas", () => {
    const payload = buildBulkOfferingPayload(
      { semester_id: "sem-1", program_studi_id: "p-1" },
      ["m1"],
      { m1: "8" },
    );

    expect(payload.akses).toBe("internal");
    expect(payload.matakuliah).toEqual([
      { matakuliah_id: "m1", jumlah_peserta_max_default: 40, jumlah_peserta_internal_max_default: 40, kuota_lintas_prodi: 0 },
    ]);
  });

  it("shows a targeted cross offering when the student's own program has no offering", () => {
    expect(activeOfferingProgramId([
      { program_studi_id: "host-1" },
      { program_studi_id: "host-2" },
    ], null, "student-prodi")).toBe("host-1");
  });

  it("keeps the student's own offering as the default when it exists", () => {
    expect(activeOfferingProgramId([
      { program_studi_id: "host-1" },
      { program_studi_id: "student-prodi" },
    ], null, "student-prodi")).toBe("student-prodi");
  });

  it("includes selected target programs as relation rows", () => {
    const payload = buildBulkOfferingPayload(
      { semester_id: "sem-1", program_studi_id: "p-1", akses: "terpilih", prodi_tujuan: ["p-2", "p-3"] },
      ["m1"],
    );
    expect(payload.prodi_tujuan).toEqual([
      { program_studi_id: "p-2" },
      { program_studi_id: "p-3" },
    ]);
  });
});

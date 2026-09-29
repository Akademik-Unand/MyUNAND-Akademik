import { describe, expect, it } from "vitest";
import { getOfferingReadiness } from "./offeringReadiness";

const readyClass = {
  nama: "A",
  dosenKelas: [{ id: "lecturer-assignment" }],
  jadwalKelas: [{ hari: "Senin", jam_mulai: "08:00", jam_selesai: "09:40" }],
};

describe("offering readiness", () => {
  it("requires at least one class and setup for every class", () => {
    expect(getOfferingReadiness({ matakuliahDitawarkan: [{ kelas: [] }] })).toMatchObject({
      ready: false,
      issues: ["Belum ada kelas"],
    });
    expect(getOfferingReadiness({
      matakuliahDitawarkan: [{ kelas: [readyClass, { nama: "B", dosenKelas: [], jadwalKelas: [] }] }],
    })).toMatchObject({ ready: false });
  });

  it("marks a complete offering ready when every course class has lecturer and schedule", () => {
    expect(getOfferingReadiness({
      matakuliahDitawarkan: [{ kelas: [readyClass] }, { kelas: [{ ...readyClass, nama: "B" }] }],
    })).toMatchObject({ ready: true, issues: [] });
  });

  it("does not mark an empty course list ready", () => {
    expect(getOfferingReadiness({ matakuliahDitawarkan: [] }).ready).toBe(false);
  });
});

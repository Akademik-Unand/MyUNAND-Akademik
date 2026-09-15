import { describe, expect, it } from "vitest";
import {
  isEligibleKelasSelection,
  kelasKrsEligibility,
  kelasKrsOption,
} from "./kelasKrsEligibility";

const readyClass = {
  id: "kelas-1",
  nama: "A",
  jadwalKelas: [
    { hari: "Senin", jam_mulai: "08:00:00", jam_selesai: "09:40:00" },
  ],
  dosenKelas: [{ dosen: { nama: "Dr. Ada" } }],
};

describe("kelasKrsEligibility", () => {
  it("siap jika minimal satu jadwal lengkap dan satu dosen tersedia", () => {
    expect(kelasKrsEligibility({
      ...readyClass,
      jadwalKelas: [{ hari: "Selasa" }, ...readyClass.jadwalKelas],
    })).toEqual({ eligible: true, reasons: [] });
  });

  it("mengembalikan alasan gabungan", () => {
    expect(kelasKrsEligibility({ jadwalKelas: [], dosenKelas: [] })).toEqual({
      eligible: false,
      reasons: ["jadwal belum lengkap", "dosen belum ditetapkan"],
    });
  });

  it("menampilkan jadwal dan dosen pada label kelas siap", () => {
    expect(kelasKrsOption(readyClass).label).toBe(
      "Kelas A — Senin · 08:00–09:40 — Dr. Ada",
    );
  });

  it("menonaktifkan kelas tidak siap namun menjaga alasan terlihat", () => {
    expect(kelasKrsOption({ ...readyClass, jadwalKelas: [] })).toMatchObject({
      disabled: true,
      label: "Kelas A — Tidak siap: jadwal belum lengkap",
    });
  });

  it("stale guard menolak id yang hilang atau telah disabled", () => {
    const options = [kelasKrsOption(readyClass), kelasKrsOption({ ...readyClass, id: "kelas-2", dosenKelas: [] })];
    expect(isEligibleKelasSelection(options, "kelas-1")).toBe(true);
    expect(isEligibleKelasSelection(options, "kelas-2")).toBe(false);
    expect(isEligibleKelasSelection(options, "kelas-lama")).toBe(false);
  });
});

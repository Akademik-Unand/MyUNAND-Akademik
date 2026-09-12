import { describe, expect, it } from "vitest";
import { validasiPeriode } from "./academicPeriod";

const semester = { tahun: 2026, tanggal_selesai: "2026-10-10" };

describe("validasiPeriode", () => {
  it("lolos saat periode di dalam jendela semester", () => {
    expect(
      validasiPeriode(
        { tanggal_mulai: "2026-08-30", tanggal_selesai: "2026-10-10" },
        semester,
      ),
    ).toBeNull();
  });

  it("menolak tanggal selesai yang melewati akhir semester", () => {
    expect(
      validasiPeriode(
        { tanggal_mulai: "2026-09-01", tanggal_selesai: "2026-12-31" },
        semester,
      ),
    ).toContain("tidak boleh melebihi tanggal selesai semester (2026-10-10)");
  });

  it("menolak tanggal selesai yang lebih awal dari tanggal mulai", () => {
    expect(
      validasiPeriode(
        { tanggal_mulai: "2026-10-01", tanggal_selesai: "2026-09-01" },
        semester,
      ),
    ).toContain("pada atau setelah tanggal mulai");
  });

  it("tidak membatasi bila semester belum punya tanggal selesai", () => {
    expect(
      validasiPeriode(
        { tanggal_mulai: "2026-09-01", tanggal_selesai: "2027-01-31" },
        { tahun: 2026, tanggal_selesai: null },
      ),
    ).toBeNull();
  });

  it("tidak membatasi bila semester belum dipilih atau tanggal kosong", () => {
    expect(validasiPeriode({ tanggal_mulai: "", tanggal_selesai: "" }, null)).toBeNull();
    expect(
      validasiPeriode({ tanggal_mulai: "2026-09-01", tanggal_selesai: "" }, undefined),
    ).toBeNull();
  });
});

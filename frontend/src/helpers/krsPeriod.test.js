import { describe, expect, it } from "vitest";
import { krsPeriodStatus } from "./krsPeriod";

describe("krsPeriodStatus", () => {
  it("menandai Belum diatur saat tanggal kosong", () => {
    expect(krsPeriodStatus({})).toMatchObject({
      label: "Belum diatur",
      variant: "ghost",
    });
    expect(krsPeriodStatus({ tanggal_mulai: "2026-01-01" })).toMatchObject({
      label: "Belum diatur",
      variant: "ghost",
    });
    expect(krsPeriodStatus(null)).toMatchObject({
      label: "Belum diatur",
      variant: "ghost",
    });
  });

  it("menandai Dibuka saat hari ini di dalam rentang", () => {
    const row = { tanggal_mulai: "2026-01-01", tanggal_selesai: "2026-01-31" };
    expect(krsPeriodStatus(row, "2026-01-01")).toMatchObject({
      label: "Dibuka",
      variant: "success",
    });
    expect(krsPeriodStatus(row, "2026-01-15")).toMatchObject({
      label: "Dibuka",
      variant: "success",
    });
    expect(krsPeriodStatus(row, "2026-01-31")).toMatchObject({
      label: "Dibuka",
      variant: "success",
    });
  });

  it("menandai Ditutup saat di luar rentang", () => {
    const row = { tanggal_mulai: "2026-01-01", tanggal_selesai: "2026-01-31" };
    expect(krsPeriodStatus(row, "2025-12-31")).toMatchObject({
      label: "Ditutup",
      variant: "warning",
    });
    expect(krsPeriodStatus(row, "2026-02-01")).toMatchObject({
      label: "Ditutup",
      variant: "warning",
    });
  });

  it("tetap membaca kolom legacy tanggal_krs_*", () => {
    const row = {
      tanggal_krs_mulai: "2026-01-01",
      tanggal_krs_selesai: "2026-01-31",
    };
    expect(krsPeriodStatus(row, "2026-01-15")).toMatchObject({
      label: "Dibuka",
      variant: "success",
    });
  });
});

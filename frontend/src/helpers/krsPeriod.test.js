import { describe, expect, it } from "vitest";
import { isKrsPeriodOpen, krsPeriodNotice, krsPeriodStatus } from "./krsPeriod";

describe("krsPeriodStatus", () => {
  it("menandai Belum diatur saat periode kosong atau belum lengkap", () => {
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
    const periode = {
      tanggal_mulai: "2026-01-01",
      tanggal_selesai: "2026-01-31",
    };
    expect(krsPeriodStatus(periode, "2026-01-01")).toMatchObject({
      label: "Dibuka",
      variant: "success",
    });
    expect(krsPeriodStatus(periode, "2026-01-15")).toMatchObject({
      label: "Dibuka",
      variant: "success",
    });
    expect(krsPeriodStatus(periode, "2026-01-31")).toMatchObject({
      label: "Dibuka",
      variant: "success",
    });
  });

  it("menandai Belum dibuka sebelum tanggal mulai", () => {
    const periode = {
      tanggal_mulai: "2026-01-01",
      tanggal_selesai: "2026-01-31",
    };
    expect(krsPeriodStatus(periode, "2025-12-31")).toMatchObject({
      label: "Belum dibuka",
      variant: "warning",
    });
  });

  it("menandai Ditutup setelah tanggal selesai", () => {
    const periode = {
      tanggal_mulai: "2026-01-01",
      tanggal_selesai: "2026-01-31",
    };
    expect(krsPeriodStatus(periode, "2026-02-01")).toMatchObject({
      label: "Ditutup",
      variant: "error",
    });
  });
});

describe("isKrsPeriodOpen", () => {
  const periode = {
    tanggal_mulai: "2026-01-01",
    tanggal_selesai: "2026-01-31",
  };

  it("true hanya di dalam rentang (kedua ujung inklusif)", () => {
    expect(isKrsPeriodOpen(periode, "2026-01-01")).toBe(true);
    expect(isKrsPeriodOpen(periode, "2026-01-31")).toBe(true);
  });

  it("false saat belum dibuka, sudah ditutup, atau belum diatur", () => {
    expect(isKrsPeriodOpen(periode, "2025-12-31")).toBe(false);
    expect(isKrsPeriodOpen(periode, "2026-02-01")).toBe(false);
    expect(isKrsPeriodOpen(null)).toBe(false);
    expect(isKrsPeriodOpen({ tanggal_mulai: "2026-01-01" })).toBe(false);
  });
});

describe("krsPeriodNotice", () => {
  it("tidak menampilkan apa pun saat jendela dibuka", () => {
    expect(
      krsPeriodNotice(
        { tanggal_mulai: "2026-01-01", tanggal_selesai: "2026-01-31" },
        "2026-01-15",
      ),
    ).toBeNull();
  });

  it("meminta admin mengatur saat periode belum diatur", () => {
    const notice = krsPeriodNotice(null, "2026-01-15");
    expect(notice.variant).toBe("warning");
    expect(notice.title).toContain("belum diatur");
    expect(notice.message).toContain("admin");
  });

  it("menyebut rentang tanggal saat belum dibuka", () => {
    const notice = krsPeriodNotice(
      { tanggal_mulai: "2026-09-01", tanggal_selesai: "2026-10-10" },
      "2026-08-20",
    );
    expect(notice.variant).toBe("info");
    expect(notice.title).toContain("belum dibuka");
    expect(notice.message).toContain("1 September 2026");
    expect(notice.message).toContain("10 Oktober 2026");
  });

  it("menyebut tanggal berakhir saat sudah ditutup", () => {
    const notice = krsPeriodNotice(
      { tanggal_mulai: "2026-08-01", tanggal_selesai: "2026-08-31" },
      "2026-09-05",
    );
    expect(notice.variant).toBe("error");
    expect(notice.title).toContain("ditutup");
    expect(notice.message).toContain("31 Agustus 2026");
  });
});

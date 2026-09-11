import { describe, expect, it } from "vitest";
import {
  dosenFilterUntukMahasiswa,
  dosenLabel,
  mahasiswaLabel,
  paStatusLabel,
  paStatusVariant,
  ringkasHasilBulk,
  toggleAllIds,
  toggleId,
  unitLabel,
} from "./bimbinganPa";

describe("label status", () => {
  it("menerjemahkan status bimbingan", () => {
    expect(paStatusLabel("aktif")).toBe("Aktif");
    expect(paStatusLabel("selesai")).toBe("Selesai");
    expect(paStatusLabel(null)).toBe("—");
  });

  it("memberi varian badge berbeda untuk aktif dan selesai", () => {
    expect(paStatusVariant("aktif")).toBe("success");
    expect(paStatusVariant("selesai")).toBe("ghost");
  });
});

describe("label baris", () => {
  it("menyertakan NIU mahasiswa bila ada", () => {
    expect(mahasiswaLabel({ nama: "Andi", niu: "2401" })).toBe("Andi (2401)");
    expect(mahasiswaLabel({ nama: "Andi" })).toBe("Andi");
    expect(mahasiswaLabel(null)).toBe("—");
  });

  it("menyertakan program studi dosen", () => {
    expect(
      dosenLabel({ nama: "Dr. Budi", programStudi: { nama_singkat: "TPB" } }),
    ).toBe("Dr. Budi — TPB");
    expect(dosenLabel({ nama: "Dr. Budi" })).toBe("Dr. Budi");
  });

  it("menampilkan unit atau strip", () => {
    expect(unitLabel({ programStudi: { nama_singkat: "TPB" } })).toBe("TPB");
    expect(unitLabel({})).toBe("—");
  });
});

describe("dosenFilterUntukMahasiswa", () => {
  it("memakai departemen mahasiswa agar seprodi & sedepartemen ikut tampil", () => {
    expect(
      dosenFilterUntukMahasiswa({
        program_studi_id: "prodi-1",
        programStudi: { departemen_id: "dep-1" },
      }),
    ).toEqual({ departemen_id: "dep-1" });
  });

  it("jatuh ke prodi bila departemen tidak diketahui", () => {
    expect(
      dosenFilterUntukMahasiswa({
        program_studi_id: "prodi-1",
        programStudi: {},
      }),
    ).toEqual({
      program_studi_id: "prodi-1",
    });
  });

  it("tanpa mahasiswa tidak memfilter", () => {
    expect(dosenFilterUntukMahasiswa(null)).toBeUndefined();
  });
});

describe("pemilihan massal", () => {
  it("toggleId menambah lalu menghapus id", () => {
    expect(toggleId([], "a")).toEqual(["a"]);
    expect(toggleId(["a", "b"], "a")).toEqual(["b"]);
  });

  it("toggleAllIds memilih semua baris yang tampil", () => {
    expect(toggleAllIds([], [{ id: "a" }, { id: "b" }])).toEqual(["a", "b"]);
  });

  it("toggleAllIds menghapus baris yang tampil saat semua sudah terpilih", () => {
    expect(toggleAllIds(["a", "b", "c"], [{ id: "a" }, { id: "b" }])).toEqual([
      "c",
    ]);
  });

  it("toggleAllIds tidak menggandakan id yang sudah dipilih", () => {
    expect(toggleAllIds(["a"], [{ id: "a" }, { id: "b" }])).toEqual(["a", "b"]);
  });
});

describe("ringkasHasilBulk", () => {
  it("merangkum penetapan, penutupan PA lama, dan yang dilewati", () => {
    expect(
      ringkasHasilBulk({
        ditetapkan: 3,
        ditutup: 2,
        dilewati: [{ alasan: "beda unit" }],
      }),
    ).toBe("3 ditetapkan · 2 PA lama ditutup · 1 dilewati");
  });

  it("aman saat hasil kosong", () => {
    expect(ringkasHasilBulk(null)).toBe("0 ditetapkan");
  });
});

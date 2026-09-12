import { describe, expect, it } from "vitest";
import { namaKelasBentrok } from "./kelasInfo";

describe("namaKelasBentrok", () => {
  it("true bila nama sudah dipakai pada mata kuliah yang sama", () => {
    expect(namaKelasBentrok("A", ["A", "B"])).toBe(true);
  });

  it("mengabaikan beda huruf besar/kecil dan spasi di tepi", () => {
    expect(namaKelasBentrok("a", ["A"])).toBe(true);
    expect(namaKelasBentrok(" B ", ["B"])).toBe(true);
  });

  it("false bila nama belum dipakai atau daftarnya kosong", () => {
    expect(namaKelasBentrok("C", ["A", "B"])).toBe(false);
    expect(namaKelasBentrok("A", [])).toBe(false);
    expect(namaKelasBentrok("A", null)).toBe(false);
  });

  it("false untuk nama kosong (dicek oleh validasi required, bukan di sini)", () => {
    expect(namaKelasBentrok("", ["A"])).toBe(false);
    expect(namaKelasBentrok("   ", ["A"])).toBe(false);
    expect(namaKelasBentrok(undefined, ["A"])).toBe(false);
  });
});

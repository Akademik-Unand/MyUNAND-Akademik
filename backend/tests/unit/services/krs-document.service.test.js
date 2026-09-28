"use strict";
jest.mock("../../../src/models", () => ({
  User: { findByPk: jest.fn() }, Krs: { findOne: jest.fn() },
  KrsDetil: {}, Mahasiswa: {}, ProgramStudi: {}, Fakultas: {}, Universitas: {},
  Semester: {}, JenisSemester: {}, Kelas: {}, Matakuliah: {}, JadwalKelas: {},
  Ruang: {}, DosenKelas: {}, Dosen: {},
}));
jest.mock("../../../src/documents/krsPdf", () => ({ renderKrsPdf: jest.fn() }));
const { User, Krs } = require("../../../src/models");
const { renderKrsPdf } = require("../../../src/documents/krsPdf");
const { downloadOwnKrs } = require("../../../src/services/krs/krs-document.service");

describe("downloadOwnKrs", () => {
  beforeEach(() => jest.resetAllMocks());
  it("membatasi query ke mahasiswa akun saat ini dan mengirim seluruh baris dokumen", async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: "student-current" });
    Krs.findOne.mockResolvedValue({ id: "krs", approval_ke: 1, krsDetil: [{ approved: "1", kelas: null }] });
    renderKrsPdf.mockResolvedValue(Buffer.from("%PDF-test"));
    const result = await downloadOwnKrs("krs", "user");
    expect(User.findByPk).toHaveBeenCalledWith("user", expect.any(Object));
    expect(Krs.findOne.mock.calls[0][0].where).toEqual({ id: "krs", mahasiswa_id: "student-current" });
    expect(Krs.findOne.mock.calls[0][0]).not.toHaveProperty("limit");
    expect(renderKrsPdf.mock.calls[0][0].rows).toHaveLength(1);
    const details = Krs.findOne.mock.calls[0][0].include.find((item) => item.as === "krsDetil");
    const kelas = details.include[0];
    expect(kelas.include.map((item) => item.as)).toEqual(["matakuliah", "jadwalKelas", "dosenKelas"]);
    expect(kelas.include[1].include[0].as).toBe("ruang");
    expect(kelas.include[2].include[0].as).toBe("dosen");
    expect(result.contentType).toBe("application/pdf");
    expect(result.buffer.toString()).toBe("%PDF-test");
  });
  it("menolak akun tanpa mahasiswa, termasuk admin yang punya izin baca", async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: null });
    await expect(downloadOwnKrs("krs", "admin")).rejects.toMatchObject({ code: 403 });
    expect(Krs.findOne).not.toHaveBeenCalled();
  });
  it("tidak merender KRS milik mahasiswa lain atau yang tidak ditemukan", async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: "own-student" });
    Krs.findOne.mockResolvedValue(null);
    await expect(downloadOwnKrs("another-krs", "user")).rejects.toMatchObject({ code: 404 });
    expect(renderKrsPdf).not.toHaveBeenCalled();
  });
  it("tidak menghasilkan PDF jika persetujuan belum lengkap", async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: "student" });
    Krs.findOne.mockResolvedValue({ approval_ke: 1, krsDetil: [{ approved: "0" }] });
    await expect(downloadOwnKrs("krs", "user")).rejects.toMatchObject({ code: 409 });
    expect(renderKrsPdf).not.toHaveBeenCalled();
  });
});
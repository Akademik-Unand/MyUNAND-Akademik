"use strict";

jest.mock("../../../src/models", () => ({
  User: { findByPk: jest.fn() },
  Semester: { findOne: jest.fn() },
  Krs: { findOne: jest.fn() },
  KrsDetil: {}, Kelas: {}, Matakuliah: {}, JadwalKelas: {}, Ruang: {},
  Mahasiswa: {}, ProgramStudi: {}, JenisSemester: {},
}));
jest.mock("../../../src/helpers/academicPeriod", () => ({
  getPeriod: jest.fn(), JENIS: { KRS: "krs" },
}));
const models = require("../../../src/models");
const { getPeriod } = require("../../../src/helpers/academicPeriod");
const { getContext } = require("../../../src/services/krs/krs.service");

describe("krs.service getContext untuk kalender", () => {
  beforeEach(() => jest.resetAllMocks());

  it("mengambil seluruh sesi dan ruangan pada KRS mahasiswa login di semester aktif", async () => {
    const mahasiswa = { id: "mahasiswa-login", programStudi: { sks_maksimal: 24 } };
    models.User.findByPk.mockResolvedValue({ mahasiswa });
    models.Semester.findOne.mockResolvedValue({ id: "semester-aktif" });
    const krs = { id: "krs", krsDetil: [
      { kelas: { jadwalKelas: [{ id: "senin", ruang: { nama: "Ruang A" } }, { id: "rabu", ruang: null }] } },
      { is_cross_enrollment: true, cross_enrollment_status: "pending_pa", kelas: { jadwalKelas: [{ id: "minggu" }] } },
    ] };
    models.Krs.findOne.mockResolvedValue(krs);
    getPeriod.mockResolvedValue({ jenis: "krs" });
    const result = await getContext("user");
    const query = models.Krs.findOne.mock.calls[0][0];
    expect(query.where).toEqual({ mahasiswa_id: mahasiswa.id, semester_id: "semester-aktif" });
    expect(query).not.toHaveProperty("limit");
    const kelasInclude = query.include.find((item) => item.as === "krsDetil").include[0];
    expect(kelasInclude.include).toContainEqual({
      model: models.JadwalKelas, as: "jadwalKelas",
      include: [{ model: models.Ruang, as: "ruang" }],
    });
    expect(result.krs).toBe(krs);
    expect(result.sks_maksimal).toBe(24);
    expect(getPeriod).toHaveBeenCalledWith("semester-aktif", "krs");
  });

  it("mengembalikan konteks kosong bila tidak ada semester aktif", async () => {
    models.User.findByPk.mockResolvedValue({ mahasiswa: { id: "mahasiswa" } });
    models.Semester.findOne.mockResolvedValue(null);
    expect(await getContext("user")).toMatchObject({ semester: null, krs: null, periode: null });
    expect(models.Krs.findOne).not.toHaveBeenCalled();
    expect(getPeriod).not.toHaveBeenCalled();
  });

  it("tidak mengembalikan jadwal akun yang tidak terhubung ke mahasiswa", async () => {
    models.User.findByPk.mockResolvedValue({});
    await expect(getContext("user")).rejects.toMatchObject({ code: 403 });
    expect(models.Krs.findOne).not.toHaveBeenCalled();
  });
});
"use strict";

jest.mock("../../../src/models", () => ({
  User: { findByPk: jest.fn() },
  Dosen: { findByPk: jest.fn() },
  BimbinganAkademik: { findOne: jest.fn() },
}));
const { User, Dosen, BimbinganAkademik } = require("../../../src/models");
const { getAcademicAdvisor } = require("../../../src/services/auth/academic-advisor.service");

describe("current student's academic advisor", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    User.findByPk.mockResolvedValue({
      id: "u1", mahasiswa_id: "m1", mahasiswa: { id: "m1" },
      roles: [{ name: "mahasiswa" }],
    });
    BimbinganAkademik.findOne.mockResolvedValue({
      dosen_id: "d1", tahun_akademik: "2026/2027",
    });
    Dosen.findByPk.mockResolvedValue({
      id: "d1", nama: "Dosen PA", nip: "123",
      programStudi: { id: "p1", nama_resmi: "S1 Teknik Pertanian dan Biosistem" },
      password: "must-not-leak",
    });
  });

  it("uses the database student link and returns only public advisor fields", async () => {
    const result = await getAcademicAdvisor("u1");
    expect(User.findByPk).toHaveBeenCalledWith("u1", expect.any(Object));
    expect(BimbinganAkademik.findOne).toHaveBeenCalledWith(expect.objectContaining({
      where: { mahasiswa_id: "m1", status: "aktif" },
      order: [["updatedAt", "DESC"]],
    }));
    expect(result).toEqual({
      status: "assigned",
      advisor: {
        id: "d1", nama: "Dosen PA", nip: "123",
        program_studi: { id: "p1", nama: "S1 Teknik Pertanian dan Biosistem" },
        tahun_akademik: "2026/2027",
      },
    });
  });

  it("rejects a deleted or missing account", async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(getAcademicAdvisor("gone")).rejects.toMatchObject({ code: 401 });
    expect(BimbinganAkademik.findOne).not.toHaveBeenCalled();
  });

  it("rejects non-students without querying anyone's assignment", async () => {
    User.findByPk.mockResolvedValue({ roles: [{ name: "dosen" }] });
    await expect(getAcademicAdvisor("u2")).rejects.toMatchObject({ code: 403 });
    expect(BimbinganAkademik.findOne).not.toHaveBeenCalled();
  });

  it("distinguishes an unlinked student account, including multi-role users", async () => {
    User.findByPk.mockResolvedValue({
      roles: [{ name: "admin-prodi" }, { name: "mahasiswa" }],
    });
    await expect(getAcademicAdvisor("u3")).resolves.toEqual({
      status: "unlinked", advisor: null,
    });
    expect(BimbinganAkademik.findOne).not.toHaveBeenCalled();
  });

  it("handles a student record that has been soft-deleted", async () => {
    User.findByPk.mockResolvedValue({ mahasiswa_id: "m1", mahasiswa: null, roles: [] });
    await expect(getAcademicAdvisor("u1")).resolves.toEqual({
      status: "unlinked", advisor: null,
    });
  });

  it("does not display a historical assignment when no active one remains", async () => {
    BimbinganAkademik.findOne.mockResolvedValue(null);
    await expect(getAcademicAdvisor("u1")).resolves.toEqual({
      status: "unassigned", advisor: null,
    });
    expect(Dosen.findByPk).not.toHaveBeenCalled();
  });

  it("does not expose soft-deleted lecturers", async () => {
    Dosen.findByPk.mockResolvedValue(null);
    await expect(getAcademicAdvisor("u1")).resolves.toEqual({
      status: "unassigned", advisor: null,
    });
    expect(Dosen.findByPk.mock.calls[0][1].paranoid).not.toBe(false);
  });

  it("allows missing optional program/academic-year data", async () => {
    BimbinganAkademik.findOne.mockResolvedValue({ dosen_id: "d1" });
    Dosen.findByPk.mockResolvedValue({ id: "d1", nama: "PA", nip: "123" });
    const { advisor } = await getAcademicAdvisor("u1");
    expect(advisor.program_studi).toBeNull();
    expect(advisor.tahun_akademik).toBeNull();
  });

  it("propagates lookup failures instead of claiming the student has no advisor", async () => {
    BimbinganAkademik.findOne.mockRejectedValue(new Error("database offline"));
    await expect(getAcademicAdvisor("u1")).rejects.toThrow("database offline");
  });
});

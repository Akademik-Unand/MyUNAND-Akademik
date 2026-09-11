import { describe, expect, it } from "vitest";
import { accountUnitInfo, isDosenAccount } from "./accountUnit";

describe("accountUnitInfo", () => {
  it("uses mahasiswa program studi as account unit", () => {
    expect(
      accountUnitInfo({
        role: "mahasiswa",
        mahasiswa_id: "m1",
        mahasiswa: {
          programStudi: {
            nama_singkat: "S1 SI",
            nama_resmi: "Sistem Informasi",
          },
        },
      }),
    ).toEqual({ label: "Prodi", value: "S1 SI", tone: "default" });
  });

  it("resolves mahasiswa program studi from organization rows when payload only has the id", () => {
    expect(
      accountUnitInfo(
        {
          role: "mahasiswa",
          mahasiswa_id: "m1",
          mahasiswa: { program_studi_id: "p1" },
        },
        { prodi: [{ id: "p1", nama_singkat: "S1 Teknik Informatika" }] },
      ),
    ).toEqual({
      label: "Prodi",
      value: "S1 Teknik Informatika",
      tone: "default",
    });
  });

  it("uses assigned organization units for non-mahasiswa users", () => {
    expect(
      accountUnitInfo({
        role: "admin-prodi",
        units: [
          {
            program_studi_id: "p1",
            program_studi: { nama: "Teknik Komputer" },
          },
        ],
      }),
    ).toEqual({ label: "Unit", value: "Teknik Komputer", tone: "default" });
  });

  it("uses dosen program studi as account unit", () => {
    expect(
      accountUnitInfo({
        role: "dosen",
        roles: [{ name: "dosen" }],
        dosen_id: "d1",
        dosen: {
          program_studi_id: "p1",
          programStudi: { nama_singkat: "S1 Teknik Pertanian dan Biosistem" },
        },
      }),
    ).toEqual({
      label: "Prodi",
      value: "S1 Teknik Pertanian dan Biosistem",
      tone: "default",
    });
  });

  it("falls back to master prodi rows for dosen payload without nested prodi", () => {
    expect(
      accountUnitInfo(
        { role: "dosen", dosen_id: "d1", dosen: { program_studi_id: "p1" } },
        { prodi: [{ id: "p1", nama_singkat: "S1 Peternakan" }] },
      ),
    ).toEqual({ label: "Prodi", value: "S1 Peternakan", tone: "default" });
  });

  it("prefers explicit units over dosen home prodi", () => {
    expect(
      accountUnitInfo({
        role: "dosen",
        dosen_id: "d1",
        dosen: { programStudi: { nama_singkat: "S1 SI" } },
        units: [{ fakultas_id: "f1", fakultas: { nama: "FTI" } }],
      }),
    ).toEqual({ label: "Unit", value: "FTI", tone: "default" });
  });

  it("summarizes multiple units", () => {
    expect(
      accountUnitInfo({
        role: "admin-prodi",
        units: [
          { program_studi_id: "p1", program_studi: { nama: "SI" } },
          { program_studi_id: "p2", program_studi: { nama: "TI" } },
          { fakultas_id: "f1", fakultas: { nama: "FTI" } },
        ],
      }).value,
    ).toBe("3 unit: SI, TI, ...");
  });
});

describe("isDosenAccount", () => {
  it("true untuk dosen & dosen-pa dengan dosen_id", () => {
    expect(isDosenAccount({ roles: [{ name: "dosen" }], dosen_id: "d1" })).toBe(
      true,
    );
    expect(isDosenAccount({ roles: [{ name: "dosen-pa" }] })).toBe(true);
  });

  it("false untuk mahasiswa, admin universitas, dan role ber-scope", () => {
    expect(isDosenAccount({ mahasiswa_id: "m1", dosen_id: "d1" })).toBe(false);
    expect(
      isDosenAccount({
        roles: [{ name: "admin-universitas" }],
        dosen_id: "d1",
      }),
    ).toBe(false);
    expect(
      isDosenAccount({
        roles: [{ name: "dosen" }],
        dosen_id: "d1",
        org_scope: { level: "prodi" },
      }),
    ).toBe(false);
  });

  it("false untuk akun biasa dan tamu", () => {
    expect(isDosenAccount({ roles: [{ name: "admin-prodi" }] })).toBe(false);
    expect(isDosenAccount(null)).toBe(false);
  });
});

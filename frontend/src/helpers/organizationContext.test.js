import { describe, expect, it } from "vitest";
import {
  contextFromDosen,
  contextFromStudent,
  dosenUnitLabel,
  filterProdiByScope,
  organizationContextLabel,
  organizationUserKey,
  reconcileOrganizationContext,
  studentUnitLabel,
  updateOrganizationDraft,
} from "./organizationContext";

const rows = {
  fakultas: [{ id: "f1", nama_singkat: "FTI" }],
  departemen: [
    { id: "d1", fakultas_id: "f1", nama_singkat: "Sistem Informasi" },
  ],
  prodi: [
    { id: "p1", fakultas_id: "f1", departemen_id: "d1", nama_singkat: "S1 SI" },
  ],
};

describe("organization context helpers", () => {
  it("uses a stable user-specific persistence key", () => {
    expect(organizationUserKey({ id: 42 })).toBe("42");
    expect(organizationUserKey(null)).toBe("");
  });

  it("clears descendants when a parent draft changes", () => {
    expect(
      updateOrganizationDraft(
        { fakultasId: "f1", departemenId: "d1", prodiId: "p1" },
        "fakultasId",
        "f2",
      ),
    ).toEqual({ fakultasId: "f2", departemenId: "", prodiId: "" });
  });

  it("reconciles invalid and mismatched persisted selections", () => {
    expect(
      reconcileOrganizationContext(
        { fakultasId: "missing", departemenId: "d1", prodiId: "p1" },
        rows,
      ),
    ).toEqual({ fakultasId: "", departemenId: "d1", prodiId: "p1" });
    expect(
      reconcileOrganizationContext(
        { fakultasId: "f1", departemenId: "other", prodiId: "p1" },
        rows,
      ),
    ).toEqual({ fakultasId: "f1", departemenId: "", prodiId: "p1" });
  });

  describe("filterProdiByScope", () => {
    const prodi = [
      { id: "p1", fakultas_id: "f1", departemen_id: "d1" },
      { id: "p2", fakultas_id: "f1", departemen_id: "d2" },
      { id: "p3", fakultas_id: "f2", departemen_id: "d3" },
      { id: "p4", departemen_id: "d1", departemen: { fakultas_id: "f1" } },
    ];

    it("keeps every prodi when no unit is selected", () => {
      expect(filterProdiByScope(prodi).map((row) => row.id)).toEqual([
        "p1",
        "p2",
        "p3",
        "p4",
      ]);
    });

    it("scopes by fakultas, including prodi whose fakultas lives on departemen", () => {
      expect(
        filterProdiByScope(prodi, { fakultasId: "f1" }).map((row) => row.id),
      ).toEqual(["p1", "p2", "p4"]);
    });

    it("narrows to a departemen when selected", () => {
      expect(
        filterProdiByScope(prodi, { fakultasId: "f1", departemenId: "d1" }).map(
          (row) => row.id,
        ),
      ).toEqual(["p1", "p4"]);
    });

    it("pins a scoped role to its own prodi", () => {
      expect(
        filterProdiByScope(prodi, {
          fakultasId: "f1",
          prodiId: "p1",
          scoped: true,
        }).map((row) => row.id),
      ).toEqual(["p1"]);
      // Unscoped user may still switch prodi within the selected fakultas.
      expect(
        filterProdiByScope(prodi, { fakultasId: "f1", prodiId: "p1" }).map(
          (row) => row.id,
        ),
      ).toEqual(["p1", "p2", "p4"]);
    });
  });

  it("uses the most specific selected organization label", () => {
    expect(
      organizationContextLabel(
        { fakultasId: "f1", departemenId: "d1", prodiId: "p1" },
        rows,
      ),
    ).toBe("S1 SI");
    expect(organizationContextLabel({}, rows)).toBe("Pilih unit");
  });

  describe("contextFromStudent", () => {
    const student = {
      id: "u1",
      mahasiswa_id: "m1",
      mahasiswa: {
        id: "m1",
        program_studi_id: "p1",
        programStudi: {
          id: "p1",
          nama_singkat: "S1 SI",
          fakultas_id: "f1",
          departemen_id: "d1",
        },
      },
    };

    it("mengambil unit dari data mahasiswa, bukan dari master unit", () => {
      expect(contextFromStudent(student)).toEqual({
        fakultasId: "f1",
        departemenId: "d1",
        prodiId: "p1",
      });
    });

    it("tetap mengembalikan konteks walau prodi belum lengkap", () => {
      expect(contextFromStudent({ mahasiswa: {} })).toEqual({
        fakultasId: "",
        departemenId: "",
        prodiId: "",
      });
    });

    it("null untuk akun non-mahasiswa", () => {
      expect(
        contextFromStudent({ id: "u2", roles: [{ name: "dosen" }] }),
      ).toBeNull();
      expect(contextFromStudent(null)).toBeNull();
    });

    it("mengenali mahasiswa dari role walau tanpa objek mahasiswa", () => {
      expect(contextFromStudent({ roles: [{ name: "mahasiswa" }] })).toEqual({
        fakultasId: "",
        departemenId: "",
        prodiId: "",
      });
    });
  });

  describe("studentUnitLabel", () => {
    it("memakai nama prodi milik mahasiswa", () => {
      expect(
        studentUnitLabel({
          mahasiswa: { programStudi: { nama_singkat: "S1 SI" } },
        }),
      ).toBe("S1 SI");
    });

    it("memberi fallback saat prodi tidak ada", () => {
      expect(studentUnitLabel({ mahasiswa: {} })).toBe(
        "Prodi belum ditetapkan",
      );
    });
  });

  describe("contextFromDosen", () => {
    const dosen = {
      id: "u9",
      roles: [{ name: "dosen" }],
      dosen_id: "d1",
      dosen: {
        id: "d1",
        program_studi_id: "p1",
        programStudi: {
          id: "p1",
          nama_singkat: "S1 SI",
          fakultas_id: "f1",
          departemen_id: "d1",
        },
      },
    };

    it("mengambil unit dari data dosen, bukan dari master unit", () => {
      expect(contextFromDosen(dosen)).toEqual({
        fakultasId: "f1",
        departemenId: "d1",
        prodiId: "p1",
      });
    });

    it("memakai program_studi_id bila objek programStudi tidak ikut", () => {
      expect(
        contextFromDosen({
          roles: [{ name: "dosen" }],
          dosen: { program_studi_id: "p2" },
        }),
      ).toEqual({ fakultasId: "", departemenId: "", prodiId: "p2" });
    });

    it("null untuk akun non-dosen", () => {
      expect(contextFromDosen({ id: "u1", mahasiswa_id: "m1" })).toBeNull();
      expect(
        contextFromDosen({ roles: [{ name: "admin-prodi" }], dosen_id: "d1" }),
      ).toBeNull();
      expect(contextFromDosen(null)).toBeNull();
    });
  });

  describe("dosenUnitLabel", () => {
    it("memakai nama prodi dosen", () => {
      expect(
        dosenUnitLabel({
          dosen: { programStudi: { nama_singkat: "S1 Peternakan" } },
        }),
      ).toBe("S1 Peternakan");
    });

    it("memberi fallback saat prodi tidak ada", () => {
      expect(dosenUnitLabel({ dosen: {} })).toBe("Prodi belum ditetapkan");
    });
  });
});

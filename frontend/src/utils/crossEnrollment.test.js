import { describe, expect, it } from "vitest";
import {
  approvalStatusLabel,
  approvalStatusTone,
  krsRowStatus,
  participantName,
  participantProgram,
  registeredKrsRows,
} from "./crossEnrollment";

describe("cross enrollment presentation", () => {
  it("renders readable participant identity", () => {
    const row = {
      krs: {
        mahasiswa: {
          nama: "Ayu",
          programStudi: { nama_singkat: "S1 Teknik Industri" },
        },
      },
    };
    expect(participantName(row)).toBe("Ayu");
    expect(participantProgram(row)).toBe("S1 Teknik Industri");
  });

  it("maps approval states for dosen PA flow", () => {
    expect(approvalStatusLabel("pending_pa")).toBe("Menunggu Dosen PA");
    expect(approvalStatusLabel("approved")).toBe("Disetujui");
    expect(approvalStatusLabel("rejected")).toBe("Ditolak");
    expect(approvalStatusTone("rejected")).toBe("badge-error");
  });
});

const kelas = (nama, kode) => ({
  nama: "A",
  matakuliah: { nama_resmi: nama, kode_matakuliah: kode },
});

describe("krsRowStatus", () => {
  it("maps regular rows from the PA decision on the KRS", () => {
    expect(krsRowStatus({ is_cross_enrollment: false, approved: "0" })).toBe(
      "pending_pa",
    );
    expect(krsRowStatus({ is_cross_enrollment: false, approved: "1" })).toBe(
      "approved",
    );
    expect(krsRowStatus({ is_cross_enrollment: false, approved: "2" })).toBe(
      "rejected",
    );
  });

  it("maps cross enrollment rows from their own pengajuan status", () => {
    expect(
      krsRowStatus({
        is_cross_enrollment: true,
        cross_enrollment_status: "pending_pa",
      }),
    ).toBe("pending_pa");
    expect(
      krsRowStatus({
        is_cross_enrollment: true,
        cross_enrollment_status: "rejected",
        approved: "2",
      }),
    ).toBe("rejected");
  });
});

describe("registeredKrsRows", () => {
  it("keeps regular and cross enrollment rows with a shared status", () => {
    const rows = registeredKrsRows([
      {
        id: "1",
        is_cross_enrollment: false,
        approved: "1",
        kelas: kelas("Kalkulus", "MAT101"),
      },
      {
        id: "2",
        is_cross_enrollment: true,
        cross_enrollment_status: "pending_pa",
        kelas: kelas("Nutrisi", "PTN1105"),
      },
      {
        id: "3",
        is_cross_enrollment: true,
        cross_enrollment_status: "approved",
        kelas: kelas("Pakan", "PTN1205"),
      },
    ]);

    expect(rows.map((row) => row.id)).toEqual(["1", "2", "3"]);
    expect(rows.map((row) => row.status)).toEqual([
      "approved",
      "pending_pa",
      "approved",
    ]);
    expect(rows.map((row) => row.lintas)).toEqual([false, true, true]);
    expect(rows.map((row) => row.aktif)).toEqual([true, true, true]);
    expect(rows[1]).toMatchObject({ nama: "Nutrisi", kode: "PTN1105" });
  });

  it("keeps rejected pengajuan visible but marks them inactive", () => {
    const rows = registeredKrsRows([
      {
        id: "1",
        is_cross_enrollment: true,
        cross_enrollment_status: "rejected",
      },
      { id: "2", is_cross_enrollment: false, approved: "0" },
    ]);

    expect(rows.map((row) => row.id)).toEqual(["1", "2"]);
    expect(rows.map((row) => row.aktif)).toEqual([false, true]);
  });

  it("tolerates an empty KRS", () => {
    expect(registeredKrsRows()).toEqual([]);
    expect(registeredKrsRows(null)).toEqual([]);
  });
});

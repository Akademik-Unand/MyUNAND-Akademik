"use strict";
const { buildKrsDocumentData, approvedDocumentRows, krsDocumentFilename } = require("../../../src/helpers/krsDocument");

const detil = (extra = {}) => ({
  approved: "1", kelas: { nama: "A", matakuliah: {
    kode_matakuliah: "PTN1201", nama_resmi: "Statistika", jumlah_sks_kurikulum: 3,
  } }, ...extra,
});
const krs = (extra = {}) => ({
  id: "krs", approval_ke: 1,
  mahasiswa: { nama: "Mahasiswa", niu: "2211111001", angkatan: 2022, programStudi: {
    nama_resmi: "Teknik Pertanian dan Biosistem",
    fakultas: { nama_resmi: "Teknologi Pertanian", universitas: { nama_resmi: "Universitas Andalas" } },
  } },
  semester: { tahun: 2026, jenisSemester: { nama: "Ganjil" } },
  krsDetil: [detil()], ...extra,
});

describe("data dokumen KRS", () => {
  it("menghitung SKS reguler + lintas yang disetujui dan mengabaikan yang ditolak", () => {
    const data = buildKrsDocumentData(krs({ krsDetil: [
      detil(), detil({ is_cross_enrollment: true, cross_enrollment_status: "approved" }),
      detil({ approved: "2" }), detil({ is_cross_enrollment: true, cross_enrollment_status: "rejected" }),
    ] }));
    expect(data.rows).toHaveLength(2);
    expect(data.totalSks).toBe(6);
    expect(data.student.university).toBe("Universitas Andalas");
    expect(data.term.year).toBe("2026/2027");
    expect(krsDocumentFilename(data)).toBe("KRS_2211111001_Ganjil_2026-2027.pdf");
  });
  it("menyiapkan jadwal terurut dengan jam dan ruang, serta dosen menurut urutan", () => {
    const item = detil();
    item.kelas.jadwalKelas = [
      { hari: "Rabu", jam_mulai: "13:00:00", jam_selesai: "14:40:00", ruang: { kode: "R-3" } },
      { hari: "Senin", jam_mulai: "08:00:00", jam_selesai: "09:40:00", ruang: { kode: "R-1" } },
    ];
    item.kelas.dosenKelas = [
      { dosen_ke: 2, dosen: { nama: "Dosen Kedua" } },
      { dosen_ke: 1, dosen: { nama: "Dosen Pertama" } },
    ];
    const data = buildKrsDocumentData(krs({ krsDetil: [item] }));
    expect(data.rows[0].schedule).toEqual([
      { day: "Senin", start: "08:00", end: "09:40", room: "R-1" },
      { day: "Rabu", start: "13:00", end: "14:40", room: "R-3" },
    ]);
    expect(data.rows[0].lecturers).toEqual(["Dosen Pertama", "Dosen Kedua"]);
    expect(data.rows[0].status).toBe("Disetujui");
  });
  it.each([0, null, -1])("menolak header belum disetujui: %s", (approval_ke) => {
    expect(() => approvedDocumentRows(krs({ approval_ke }))).toThrow(/belum disetujui/);
  });
  it.each([
    detil({ approved: "0" }),
    detil({ is_cross_enrollment: true, cross_enrollment_status: "pending_pa" }),
    detil({ is_cross_enrollment: true, cross_enrollment_status: null }),
  ])("menahan seluruh dokumen jika satu baris masih menunggu", (pending) => {
    expect(() => approvedDocumentRows(krs({ krsDetil: [detil(), pending] }))).toThrow(/Masih ada/);
  });
  it.each([[[]], [[detil({ approved: "2" })]]])("menolak KRS tanpa mata kuliah berlaku", (krsDetil) => {
    expect(() => approvedDocumentRows(krs({ krsDetil }))).toThrow(/Tidak ada mata kuliah/);
  });
  it("mengosongkan data hilang tanpa menghilangkan baris atau mengarang total SKS", () => {
    const data = buildKrsDocumentData(krs({
      mahasiswa: null, semester: null, krsDetil: [detil(), detil({ kelas: null })],
    }));
    expect(data.rows).toHaveLength(2);
    expect(data.rows[0]).toMatchObject({ code: "", name: "", className: "", sks: null, schedule: [], lecturers: [], status: "Disetujui" });
    expect(data.student.name).toBe("");
    expect(data.totalSks).toBeNull();
    expect(data.notes.join(" ")).toContain("total SKS");
    expect(data.notes.join(" ")).toContain("jadwal mata kuliah");
    expect(data.term.year).toBe("");
  });
  it("tidak mengambil identitas approver dari PA aktif, cross enrollment, atau jam_selesai", () => {
    const data = buildKrsDocumentData(krs({
      jam_selesai: "2026-09-01",
      dosenPa: { nama: "PA Baru" },
      krsDetil: [detil({ pa_approved_by: "approver-lintas", pa_approved_at: "2026-09-01" })],
    }));
    expect(data.approval).toEqual({ name: "", date: "", signature: "" });
    expect(data.notes[0]).toContain("dikosongkan");
  });
  it("membedakan SKS nol dari yang tidak tersedia dan mencegah nama berkas berbahaya", () => {
    const item = detil();
    item.kelas.matakuliah.jumlah_sks_kurikulum = 0;
    const data = buildKrsDocumentData(krs({ krsDetil: [item] }));
    expect(data.totalSks).toBe(0);
    data.student.nim = '../../"\r\nX-Header: nilai';
    expect(krsDocumentFilename(data)).not.toMatch(/[\r\n/"\\]/);
  });
});
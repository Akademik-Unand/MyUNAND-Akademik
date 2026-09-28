"use strict";
const { renderKrsPdf } = require("../../../src/documents/krsPdf");
const { buildKrsDocumentData } = require("../../../src/helpers/krsDocument");

const document = (count) => buildKrsDocumentData({
  approval_ke: 1,
  mahasiswa: { nama: "Mahasiswa dengan nama panjang untuk memeriksa pemenggalan baris dokumen", niu: "2211111001" },
  semester: { tahun: 2026, jenisSemester: { nama: "Ganjil" } },
  krsDetil: Array.from({ length: count }, (_, i) => ({
    approved: "1", kelas: {
      nama: "A", matakuliah: {
        kode_matakuliah: "PTN" + String(i + 1).padStart(4, "0"),
        nama_resmi: "Analisis Sistem Teknik Pertanian dan Biosistem Berkelanjutan",
        jumlah_sks_kurikulum: 3,
      },
      jadwalKelas: [
        { hari: "Senin", jam_mulai: "08:00:00", jam_selesai: "09:40:00", ruang: { kode: "R-1" } },
        { hari: "Rabu", jam_mulai: "13:00:00", jam_selesai: "14:40:00", ruang: { kode: "R-3" } },
      ],
      dosenKelas: [{ dosen_ke: 1, dosen: { nama: "Dosen Pengampu Pengujian" } }],
    },
  })),
});
describe("render PDF KRS", () => {
  it("menghasilkan PDF A4 dengan kedua logo, font tertanam, dan metadata", async () => {
    const buffer = await renderKrsPdf(document(4));
    const pdf = buffer.toString("latin1");
    expect(pdf.startsWith("%PDF-")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    expect(pdf).toMatch(/\/MediaBox \[0 0 595\.28 841\.89\]/);
    expect(pdf).toContain("/FontFile2");
    expect((pdf.match(/\/Subtype \/Image/g) || []).length).toBeGreaterThanOrEqual(2);
    expect(pdf).toContain("Kartu Rencana Studi");
    expect(pdf.match(/\/Type \/Page\b/g)).toHaveLength(1);
  });
  it("menyediakan halaman lanjutan untuk banyak mata kuliah", async () => {
    const buffer = await renderKrsPdf(document(45));
    expect(buffer.toString("latin1").match(/\/Type \/Page\b/g).length).toBeGreaterThan(1);
  });
});
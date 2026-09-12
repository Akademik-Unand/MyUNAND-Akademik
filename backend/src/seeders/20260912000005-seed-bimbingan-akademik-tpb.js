"use strict";

const { randomUUID } = require("crypto");

const PRODI_KODE = "80203"; // S1 Teknik Pertanian dan Biosistem
const CATATAN = "Seeder PA TPB";

const row = (now, extra) => ({
  id: randomUUID(),
  createdAt: now,
  updatedAt: now,
  ...extra,
});

const allRows = async (queryInterface, sql, replacements = {}) => {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  return rows;
};

/**
 * Mahasiswa Teknik Pertanian dan Biosistem (80203) hasil import portal TPB tidak
 * punya dosen Pembimbing Akademik, padahal KRS — reguler maupun lintas prodi —
 * disetujui oleh PA. Seeder ini menetapkan satu dosen PA aktif per mahasiswa
 * secara round-robin supaya alur KRS bisa dipakai.
 *
 * Idempoten: mahasiswa yang sudah punya baris bimbingan apa pun dilewati.
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const prodi = (
      await allRows(
        queryInterface,
        "SELECT id FROM program_studi WHERE kode_prodi = :kode LIMIT 1",
        {
          kode: PRODI_KODE,
        },
      )
    )[0];
    if (!prodi) return;

    const dosenIds = (
      await allRows(
        queryInterface,
        "SELECT id FROM dosen WHERE program_studi_id = :prodi AND deletedAt IS NULL ORDER BY nip",
        { prodi: prodi.id },
      )
    ).map((item) => item.id);
    if (!dosenIds.length) {
      throw new Error(
        "Seeder PA TPB butuh data dosen prodi 80203. Jalankan seeder import TPB terlebih dahulu.",
      );
    }

    const mahasiswaIds = (
      await allRows(
        queryInterface,
        `SELECT m.id FROM mahasiswa m
         WHERE m.program_studi_id = :prodi
           AND m.deletedAt IS NULL
           AND NOT EXISTS (SELECT 1 FROM bimbingan_akademik ba WHERE ba.mahasiswa_id = m.id)
         ORDER BY m.niu`,
        { prodi: prodi.id },
      )
    ).map((item) => item.id);

    const aktif = (
      await allRows(
        queryInterface,
        `SELECT s.tahun, js.nama AS jenis
         FROM semester s
         JOIN jenis_semester js ON js.id = s.jenis_semester_id
         WHERE s.is_aktif = 1 AND s.deletedAt IS NULL
         LIMIT 1`,
      )
    )[0];
    // Genap tahun N = tahun akademik (N-1)/(N); Ganjil tahun N = N/(N+1).
    const startYear = aktif
      ? /genap/i.test(aktif.jenis)
        ? aktif.tahun - 1
        : aktif.tahun
      : null;
    const tahunAkademik = startYear ? `${startYear}/${startYear + 1}` : null;

    const rows = mahasiswaIds.map((mahasiswaId, index) =>
      row(now, {
        dosen_id: dosenIds[index % dosenIds.length],
        mahasiswa_id: mahasiswaId,
        tahun_akademik: tahunAkademik,
        status: "aktif",
        catatan: CATATAN,
      }),
    );

    for (let i = 0; i < rows.length; i += 200) {
      const part = rows.slice(i, i + 200);
      if (part.length)
        await queryInterface.bulkInsert("bimbingan_akademik", part);
    }
  },

  async down(queryInterface) {
    // Hanya menghapus bimbingan yang dibuat seeder ini.
    await queryInterface.bulkDelete("bimbingan_akademik", { catatan: CATATAN });
  },
};

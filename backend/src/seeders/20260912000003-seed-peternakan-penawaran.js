"use strict";

const { randomUUID } = require("crypto");

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

const requireId = (value, label) => {
  if (!value)
    throw new Error(
      `Seeder peternakan penawaran membutuhkan ${label || "data pendukung"}. Jalankan seeder terkait dulu.`,
    );
  return value;
};

const ensureRow = async (queryInterface, table, whereKeys) => {
  const where = Object.fromEntries(
    Object.entries(whereKeys).filter(([, value]) => value != null),
  );
  const cols = Object.keys(where);
  const condition = cols.map((col) => `${col} = :${col}`).join(" AND ");
  const [existing] = await allRows(
    queryInterface,
    `SELECT id FROM ${table} WHERE ${condition} LIMIT 1`,
    where,
  );
  return existing;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const prodiPtn = requireId(
      (
        await allRows(
          queryInterface,
          "SELECT id FROM program_studi WHERE kode_prodi = '54231' LIMIT 1",
        )
      )[0],
    ).id;
    const prodiNtp = requireId(
      (
        await allRows(
          queryInterface,
          "SELECT id FROM program_studi WHERE kode_prodi = '54240' LIMIT 1",
        )
      )[0],
    ).id;

    // Target semester aktif (yang tampil default di halaman Penawaran).
    const aktif = requireId(
      (
        await allRows(
          queryInterface,
          "SELECT id, tanggal_mulai, tanggal_selesai FROM semester WHERE is_aktif = 1 LIMIT 1",
        )
      )[0],
    );

    const genap = requireId(
      (
        await allRows(
          queryInterface,
          "SELECT id FROM jenis_semester WHERE nama = 'Genap' LIMIT 1",
        )
      )[0],
    ).id;

    // MK yang termasuk semester genap (jenis_semester_id = Genap).
    const mkIdsByProdi = {};
    for (const [nama, prodiId] of [
      ["Peternakan", prodiPtn],
      ["NTP", prodiNtp],
    ]) {
      mkIdsByProdi[nama] = (
        await allRows(
          queryInterface,
          "SELECT id, kode_matakuliah FROM matakuliah WHERE program_studi_id = :prodi AND jenis_semester_id = :genap",
          { prodi: prodiId, genap },
        )
      ).map((item) => item.id);
    }

    const semesterProdiIds = {};
    for (const [nama, prodiId] of [
      ["Peternakan", prodiPtn],
      ["NTP", prodiNtp],
    ]) {
      let sp = await ensureRow(queryInterface, "semester_prodi", {
        program_studi_id: prodiId,
        semester_id: aktif.id,
      });
      if (!sp) {
        const id = randomUUID();
        await queryInterface.bulkInsert("semester_prodi", [
          row(now, {
            id,
            program_studi_id: prodiId,
            semester_id: aktif.id,
            is_aktif: true,
            sks_default: 18,
            sks_maksimal: 24,
          }),
        ]);
        sp = { id };
      }
      semesterProdiIds[nama] = sp.id;
    }

    for (const [nama, spId] of Object.entries(semesterProdiIds)) {
      let penawaran = await ensureRow(queryInterface, "penawaran_matakuliah", {
        semester_prodi_id: spId,
      });
      if (!penawaran) {
        const id = randomUUID();
        await queryInterface.bulkInsert("penawaran_matakuliah", [
          row(now, {
            id,
            semester_prodi_id: spId,
            status: "draft",
            akses: "semua",
            kuota_lintas_prodi_default: 0,
            tanggal_mulai: aktif.tanggal_mulai,
            tanggal_selesai: aktif.tanggal_selesai,
          }),
        ]);
        penawaran = { id };
      }

      const sudahAda = new Set(
        (
          await allRows(
            queryInterface,
            "SELECT matakuliah_id FROM penawaran_matakuliah_detil WHERE penawaran_matakuliah_id = :pmid",
            { pmid: penawaran.id },
          )
        ).map((item) => item.matakuliah_id),
      );
      const detil = mkIdsByProdi[nama]
        .filter((mkId) => !sudahAda.has(mkId))
        .map((mkId) =>
          row(now, {
            penawaran_matakuliah_id: penawaran.id,
            matakuliah_id: mkId,
          }),
        );
      if (detil.length) {
        await queryInterface.bulkInsert("penawaran_matakuliah_detil", detil);
      }
    }
  },

  async down(queryInterface) {
    const prodiPtn = (
      await allRows(
        queryInterface,
        "SELECT id FROM program_studi WHERE kode_prodi = '54231' LIMIT 1",
      )
    )[0];
    const prodiNtp = (
      await allRows(
        queryInterface,
        "SELECT id FROM program_studi WHERE kode_prodi = '54240' LIMIT 1",
      )
    )[0];
    const aktif = (
      await allRows(
        queryInterface,
        "SELECT id FROM semester WHERE is_aktif = 1 LIMIT 1",
      )
    )[0];
    if (!aktif) return;

    const prodiIds = [prodiPtn?.id, prodiNtp?.id].filter(Boolean);
    if (!prodiIds.length) return;

    await queryInterface.sequelize.query(
      `DELETE pmd FROM penawaran_matakuliah_detil pmd
       INNER JOIN penawaran_matakuliah pm ON pm.id = pmd.penawaran_matakuliah_id
       INNER JOIN semester_prodi sp ON sp.id = pm.semester_prodi_id
       WHERE sp.semester_id = :semester AND sp.program_studi_id IN (:prodis)`,
      { replacements: { semester: aktif.id, prodis: prodiIds } },
    );
    await queryInterface.sequelize.query(
      `DELETE pm FROM penawaran_matakuliah pm
       INNER JOIN semester_prodi sp ON sp.id = pm.semester_prodi_id
       WHERE sp.semester_id = :semester AND sp.program_studi_id IN (:prodis)`,
      { replacements: { semester: aktif.id, prodis: prodiIds } },
    );
    await queryInterface.sequelize.query(
      "DELETE FROM semester_prodi WHERE semester_id = :semester AND program_studi_id IN (:prodis)",
      { replacements: { semester: aktif.id, prodis: prodiIds } },
    );
  },
};

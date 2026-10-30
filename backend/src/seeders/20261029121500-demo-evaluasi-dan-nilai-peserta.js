"use strict";

const { randomUUID } = require("crypto");

const LAPORAN_SI_NAME =
  "Laporan Evaluasi Capaian Pembelajaran (OBE) Sistem Informasi — Ganjil 2024/2025";
const LAPORAN_MAT_NAME =
  "Laporan Evaluasi Capaian Pembelajaran (OBE) Matematika — Ganjil 2024/2025";
const LAPORAN_TPB_NAME =
  "Laporan Evaluasi Capaian Pembelajaran (OBE) Teknik Pertanian dan Biosistem — Ganjil 2024/2025";
const SEED_HISTORY_KET =
  "Seed Demo: Unggah nilai komponen evaluasi OBE (UTS, UAS, Tugas, Kuis)";
const SEED_DOKUMEN_PREFIX = "Dokumen Evaluasi OBE — ";

const allRows = async (queryInterface, sql, replacements = {}, transaction) => {
  const [rows] = await queryInterface.sequelize.query(sql, {
    replacements,
    transaction,
  });
  return rows;
};

const chunkInsert = async (
  queryInterface,
  table,
  rows,
  transaction,
  size = 150,
) => {
  for (let i = 0; i < rows.length; i += size) {
    const slice = rows.slice(i, i + size);
    if (slice.length) {
      await queryInterface.bulkInsert(table, slice, { transaction });
    }
  }
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.sequelize.transaction(async (t) => {
      // 1. Set krs_detil.approved = '2' (Disetujui PA) untuk semua KRS yang sudah punya nilai
      //    atau yang KRS induknya sudah disetujui (approval_ke >= 1), agar muncul sebagai
      //    Peserta Kelas di halaman Upload Nilai, Evaluasi CPMK, dan Rapor CPL Mahasiswa.
      await queryInterface.sequelize.query(
        `UPDATE krs_detil kd
         INNER JOIN krs k ON k.id = kd.krs_id
         SET kd.approved = '2'
         WHERE kd.approved = '1'
           AND (
             k.approval_ke >= 1
             OR EXISTS (
               SELECT 1 FROM nilai_mahasiswa nm WHERE nm.krs_detil_id = kd.id
             )
           )`,
        { transaction: t },
      );

      // Cari user superadmin untuk atribut user_id / dibuat_oleh
      const superadmins = await allRows(
        queryInterface,
        "SELECT id FROM users WHERE email = 'superadmin@email.com' LIMIT 1",
        {},
        t,
      );
      const adminUserId = superadmins[0]?.id || null;

      // 2. Hitung dan isi tabel evaluasi_cpmk dari data nilai_mahasiswa aktual per kelas & CPMK
      const rawEvalStats = await allRows(
        queryInterface,
        `SELECT
           kd.kelas_id,
           sp.cpmk_id,
           c.parent_cpmk_id,
           kd.id AS krs_detil_id,
           SUM(nm.nilai * sp.bobot) / NULLIF(SUM(sp.bobot), 0) AS skor_cpmk
         FROM krs_detil kd
         INNER JOIN nilai_mahasiswa nm ON nm.krs_detil_id = kd.id
         INNER JOIN sumber_penilaian sp ON sp.id = nm.sumber_penilaian_id
         INNER JOIN cpmk c ON c.id = sp.cpmk_id
         WHERE kd.approved = '2' OR kd.cross_enrollment_status = 'approved'
         GROUP BY kd.kelas_id, sp.cpmk_id, c.parent_cpmk_id, kd.id`,
        {},
        t,
      );

      // Kelompokkan per (kelas_id, cpmk_id) untuk leaf CPMK, serta agregasi ke parent_cpmk_id bila ada
      const scoresByKelasCpmk = new Map();
      const pushScore = (kelasId, cpmkId, krsDetilId, score) => {
        if (!kelasId || !cpmkId || score == null) return;
        const key = `${kelasId}::${cpmkId}`;
        if (!scoresByKelasCpmk.has(key)) {
          scoresByKelasCpmk.set(key, new Map());
        }
        const byStudent = scoresByKelasCpmk.get(key);
        const prev = byStudent.get(krsDetilId) || [];
        prev.push(Number(score));
        byStudent.set(krsDetilId, prev);
      };

      for (const row of rawEvalStats) {
        pushScore(row.kelas_id, row.cpmk_id, row.krs_detil_id, row.skor_cpmk);
        if (row.parent_cpmk_id) {
          pushScore(
            row.kelas_id,
            row.parent_cpmk_id,
            row.krs_detil_id,
            row.skor_cpmk,
          );
        }
      }

      const existingEval = await allRows(
        queryInterface,
        "SELECT kelas_id, cpmk_id FROM evaluasi_cpmk",
        {},
        t,
      );
      const existingEvalKeys = new Set(
        existingEval.map((r) => `${r.kelas_id}::${r.cpmk_id}`),
      );

      const evalInserts = [];
      for (const [key, byStudent] of scoresByKelasCpmk.entries()) {
        if (existingEvalKeys.has(key)) continue;
        const [kelas_id, cpmk_id] = key.split("::");
        const studentScores = [...byStudent.values()].map(
          (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
        );
        if (!studentScores.length) continue;

        const totalPeserta = studentScores.length;
        const targetNilaiMin = 60;
        const targetPersenLulus = 65;
        const jumlahLulus = studentScores.filter(
          (val) => val >= targetNilaiMin,
        ).length;
        const rataRata =
          Math.round(
            (studentScores.reduce((a, b) => a + b, 0) / totalPeserta) * 100,
          ) / 100;
        const capaianPersen =
          Math.round((jumlahLulus / totalPeserta) * 10000) / 100;
        const tercapai = capaianPersen >= targetPersenLulus;

        evalInserts.push({
          id: randomUUID(),
          kelas_id,
          cpmk_id,
          target_nilai_min: targetNilaiMin,
          target_persen_lulus: targetPersenLulus,
          capaian_persen: capaianPersen,
          rata_rata: rataRata,
          jumlah_lulus: jumlahLulus,
          analisis: tercapai
            ? `Target ketercapaian CPMK terpenuhi (${capaianPersen}% mahasiswa mencapai nilai >= ${targetNilaiMin}, melampaui target ${targetPersenLulus}%).`
            : `Capaian CPMK (${capaianPersen}%) masih perlu ditingkatkan menuju target ${targetPersenLulus}%.`,
          tindak_lanjut: tercapai
            ? "Pertahankan metode Case Method & Team-Based Project serta perkaya studi kasus praktikum."
            : "Tambahkan sesi klinik/responsi terstruktur dan evaluasi formatif pada materi terkait.",
          createdAt: now,
          updatedAt: now,
        });
      }
      await chunkInsert(queryInterface, "evaluasi_cpmk", evalInserts, t);

      // 3. Isi History Upload Nilai untuk kelas-kelas yang sudah memiliki nilai
      const gradedClasses = await allRows(
        queryInterface,
        `SELECT DISTINCT kd.kelas_id, COUNT(nm.id) AS total_nilai
         FROM krs_detil kd
         INNER JOIN nilai_mahasiswa nm ON nm.krs_detil_id = kd.id
         GROUP BY kd.kelas_id`,
        {},
        t,
      );
      const existingHistory = await allRows(
        queryInterface,
        "SELECT DISTINCT kelas_id FROM history_upload_nilai",
        {},
        t,
      );
      const historyClassIds = new Set(existingHistory.map((r) => r.kelas_id));
      const historyInserts = gradedClasses
        .filter((r) => !historyClassIds.has(r.kelas_id))
        .map((r) => ({
          id: randomUUID(),
          kelas_id: r.kelas_id,
          user_id: adminUserId,
          tipe: "Bulk Excel / Form",
          file_name: "nilai_obe_semester.xlsx",
          keterangan: `${SEED_HISTORY_KET} (${r.total_nilai} entri nilai)`,
          createdAt: now,
          updatedAt: now,
        }));
      await chunkInsert(
        queryInterface,
        "history_upload_nilai",
        historyInserts,
        t,
      );

      // 4. Hitung dan isi tabel rekap_cp (Rekap CPL per mahasiswa per semester)
      const rawRekapCp = await allRows(
        queryInterface,
        `SELECT
           k.mahasiswa_id,
           cp.id AS cp_id,
           k.semester_id,
           ROUND(AVG(nm.nilai), 2) AS nilai_capaian,
           MAX(COALESCE(cp.nilai_min, 60)) AS nilai_min
         FROM nilai_mahasiswa nm
         INNER JOIN krs_detil kd ON kd.id = nm.krs_detil_id
         INNER JOIN krs k ON k.id = kd.krs_id
         INNER JOIN sumber_penilaian sp ON sp.id = nm.sumber_penilaian_id
         INNER JOIN cpmk c ON c.id = sp.cpmk_id
         INNER JOIN cpmk_scp cs ON cs.cpmk_id = c.id OR cs.cpmk_id = c.parent_cpmk_id
         INNER JOIN scp ON scp.id = cs.scp_id
         INNER JOIN cp ON cp.id = scp.cp_id
         WHERE kd.approved = '2' OR kd.cross_enrollment_status = 'approved'
         GROUP BY k.mahasiswa_id, cp.id, k.semester_id`,
        {},
        t,
      );
      const existingRekap = await allRows(
        queryInterface,
        "SELECT mahasiswa_id, cp_id, semester_id FROM rekap_cp",
        {},
        t,
      );
      const existingRekapKeys = new Set(
        existingRekap.map(
          (r) => `${r.mahasiswa_id}::${r.cp_id}::${r.semester_id}`,
        ),
      );
      const rekapInserts = [];
      for (const r of rawRekapCp) {
        const key = `${r.mahasiswa_id}::${r.cp_id}::${r.semester_id}`;
        if (existingRekapKeys.has(key)) continue;
        existingRekapKeys.add(key);
        const capaian = Number(r.nilai_capaian || 0);
        rekapInserts.push({
          id: randomUUID(),
          mahasiswa_id: r.mahasiswa_id,
          cp_id: r.cp_id,
          semester_id: r.semester_id,
          nilai_capaian: capaian,
          status_lulus: capaian >= Number(r.nilai_min || 60),
          createdAt: now,
          updatedAt: now,
        });
      }
      await chunkInsert(queryInterface, "rekap_cp", rekapInserts, t);

      // 5. Isi Dokumen Evaluasi & Laporan CP (5-Tab View) untuk Prodi Sistem Informasi & Matematika
      const jenisDokumenRows = await allRows(
        queryInterface,
        "SELECT * FROM jenis_dokumen_evaluasi ORDER BY createdAt ASC",
        {},
        t,
      );
      let defaultJenisDokumenId = jenisDokumenRows.find(
        (r) => !r.deletedAt,
      )?.id;
      if (!defaultJenisDokumenId) {
        defaultJenisDokumenId = randomUUID();
        await queryInterface.bulkInsert(
          "jenis_dokumen_evaluasi",
          [
            {
              id: defaultJenisDokumenId,
              nama: "Portofolio & RPS OBE",
              tipe: "PDF",
              keterangan:
                "Dokumen Rencana Pembelajaran Semester (RPS) dan Portofolio Evaluasi CPMK",
              createdAt: now,
              updatedAt: now,
            },
          ],
          { transaction: t },
        );
      }

      const semesters = (
        await allRows(
          queryInterface,
          "SELECT * FROM semester ORDER BY is_aktif DESC, tahun DESC",
          {},
          t,
        )
      ).filter((r) => !r.deletedAt);
      const activeSem =
        semesters.find((s) => s.tahun === 2024 && s.is_aktif) || semesters[0];

      if (activeSem) {
        // Tambahkan dokumen evaluasi pada mata kuliah yang punya kelas di semester aktif
        const mkInActiveSem = await allRows(
          queryInterface,
          `SELECT DISTINCT k.matakuliah_id, mk.kode_matakuliah, mk.nama_resmi
           FROM kelas k
           INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
           WHERE k.semester_id = :semId`,
          { semId: activeSem.id },
          t,
        );
        const existingDocs = await allRows(
          queryInterface,
          "SELECT matakuliah_id, semester_id FROM dokumen_evaluasi WHERE semester_id = :semId",
          { semId: activeSem.id },
          t,
        );
        const docMkSet = new Set(existingDocs.map((d) => d.matakuliah_id));
        const docInserts = [];
        for (const mk of mkInActiveSem) {
          if (docMkSet.has(mk.matakuliah_id)) continue;
          docInserts.push(
            {
              id: randomUUID(),
              nama: `${SEED_DOKUMEN_PREFIX}RPS & Rubrik ${mk.kode_matakuliah} ${mk.nama_resmi}`,
              jenis_dokumen_evaluasi_id: defaultJenisDokumenId,
              kelas_id: null,
              matakuliah_id: mk.matakuliah_id,
              semester_id: activeSem.id,
              file_path: `rps-obe-${String(mk.kode_matakuliah).toLowerCase()}.pdf`,
              user_id: adminUserId,
              keterangan:
                "RPS berbasis Case Method / Team-Based Project sesuai standar LP3M UNAND",
              createdAt: now,
              updatedAt: now,
            },
            {
              id: randomUUID(),
              nama: `${SEED_DOKUMEN_PREFIX}Portofolio Capaian CPMK ${mk.kode_matakuliah}`,
              jenis_dokumen_evaluasi_id: defaultJenisDokumenId,
              kelas_id: null,
              matakuliah_id: mk.matakuliah_id,
              semester_id: activeSem.id,
              file_path: `portofolio-cpmk-${String(mk.kode_matakuliah).toLowerCase()}.pdf`,
              user_id: adminUserId,
              keterangan:
                "Rekapitulasi analisis ketercapaian CPMK dan rencana tindak lanjut perbaikan berkelanjutan (CQI)",
              createdAt: now,
              updatedAt: now,
            },
          );
        }
        await chunkInsert(queryInterface, "dokumen_evaluasi", docInserts, t);

        // Buat Laporan CP untuk Prodi Sistem Informasi (57201), Matematika (44201), & TPB (80203)
        const prodis = await allRows(
          queryInterface,
          "SELECT id, kode_prodi, nama_resmi FROM program_studi WHERE kode_prodi IN ('57201', '44201', '80203')",
          {},
          t,
        );
        for (const prodi of prodis) {
          const lapName =
            prodi.kode_prodi === "57201"
              ? LAPORAN_SI_NAME
              : prodi.kode_prodi === "80203"
                ? LAPORAN_TPB_NAME
                : LAPORAN_MAT_NAME;
          await queryInterface.bulkDelete(
            "laporan_cp",
            { nama_laporan: lapName },
            { transaction: t },
          );

          const kurikulums = (
            await allRows(
              queryInterface,
              "SELECT * FROM kurikulum WHERE program_studi_id = :prodiId ORDER BY tahun DESC",
              { prodiId: prodi.id },
              t,
            )
          ).filter((r) => !r.deletedAt);
          const kur = kurikulums[0];
          if (!kur) continue;

          const previewItems = await allRows(
            queryInterface,
            `SELECT DISTINCT
               cpmk.id AS cpmk_id,
               mk.id AS matakuliah_id,
               k.semester_id AS semester_id
             FROM cpmk
             INNER JOIN matakuliah mk ON mk.id = cpmk.matakuliah_id
             INNER JOIN matakuliah_kurikulum mkk ON mkk.matakuliah_id = mk.id AND mkk.kurikulum_id = :kurId
             INNER JOIN cpmk_scp cs ON cs.cpmk_id = cpmk.id OR cs.cpmk_id = cpmk.parent_cpmk_id
             INNER JOIN scp ON scp.id = cs.scp_id
             INNER JOIN cp ON cp.id = scp.cp_id AND cp.kurikulum_id = :kurId
             LEFT JOIN kelas k ON k.matakuliah_id = mk.id AND k.semester_id = :semId
             WHERE k.semester_id = :semId`,
            { kurId: kur.id, semId: activeSem.id },
            t,
          );

          if (!previewItems.length) continue;

          const laporanId = randomUUID();
          await queryInterface.bulkInsert(
            "laporan_cp",
            [
              {
                id: laporanId,
                program_studi_id: prodi.id,
                kurikulum_id: kur.id,
                nama_laporan: lapName,
                keterangan:
                  "Laporan evaluasi ketercapaian CPL, SCP, dan CPMK semester aktif (siap ditinjau untuk akreditasi & IKU-7 UNAND).",
                file_path: `laporan-cp-${prodi.kode_prodi}-ganjil-2024.pdf`,
                dibuat_oleh: adminUserId,
                semester_id: activeSem.id,
                createdAt: now,
                updatedAt: now,
              },
            ],
            { transaction: t },
          );

          const detilInserts = previewItems.map((item) => ({
            id: randomUUID(),
            laporan_cp_id: laporanId,
            cpmk_id: item.cpmk_id,
            matakuliah_id: item.matakuliah_id,
            semester_id: item.semester_id || activeSem.id,
            createdAt: now,
            updatedAt: now,
          }));
          await chunkInsert(
            queryInterface,
            "laporan_cp_detil",
            detilInserts,
            t,
          );
        }
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.sequelize.query(
        "DELETE FROM dokumen_evaluasi WHERE nama LIKE :prefix",
        { replacements: { prefix: `${SEED_DOKUMEN_PREFIX}%` }, transaction: t },
      );
      await queryInterface.sequelize.query(
        "DELETE FROM history_upload_nilai WHERE keterangan LIKE :prefix",
        { replacements: { prefix: `${SEED_HISTORY_KET}%` }, transaction: t },
      );
      const lapRows = await allRows(
        queryInterface,
        "SELECT id FROM laporan_cp WHERE nama_laporan IN (:names)",
        { names: [LAPORAN_SI_NAME, LAPORAN_MAT_NAME] },
        t,
      );
      if (lapRows.length) {
        await queryInterface.bulkDelete(
          "laporan_cp_detil",
          { laporan_cp_id: lapRows.map((r) => r.id) },
          { transaction: t },
        );
        await queryInterface.bulkDelete(
          "laporan_cp",
          { id: lapRows.map((r) => r.id) },
          { transaction: t },
        );
      }
    });
  },
};

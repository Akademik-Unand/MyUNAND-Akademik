"use strict";

const { randomUUID } = require("crypto");
const { spawnSync } = require("child_process");
const config = require("../config/penjadwalan");
const {
  buildProblem,
  comparison,
  validateAssignments,
} = require("../helpers/penjadwalan/domain");
const {
  makeSnapshot,
} = require("../services/penjadwalan/snapshot.service");

const SCENARIO_SOLVED_NAME = "Pilot Jadwal Global FTI — Siap Tinjau & Publikasi";
const SCENARIO_DRAFT_NAME = "Simulasi Jadwal FTI — Draf Siap Uji Live Solver";

const allRows = async (queryInterface, sql, replacements = {}, transaction) => {
  const [rows] = await queryInterface.sequelize.query(sql, {
    replacements,
    transaction,
  });
  return rows;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.sequelize.transaction(async (t) => {
      // 1. Cari semester aktif (fallback ke semester terbaru jika tidak ada yang aktif)
      const rawSemesters = await allRows(
        queryInterface,
        "SELECT * FROM semester ORDER BY is_aktif DESC, tahun DESC",
        {},
        t,
      );
      const semesters = rawSemesters.filter((r) => !r.deletedAt);
      if (!semesters.length) return;
      const semester = semesters[0];
      const semesterId = semester.id;

      // 2. Cari Fakultas Teknologi Informasi (kode 15)
      const rawFaculties = await allRows(
        queryInterface,
        "SELECT * FROM fakultas WHERE kode_fakultas = '15' OR nama_resmi LIKE '%Teknologi Informasi%'",
        {},
        t,
      );
      const faculties = rawFaculties.filter((r) => !r.deletedAt);
      if (!faculties.length) return;
      const fakultasId = faculties[0].id;

      // 3. Pastikan Gedung F, G (Utama) dan H (Cadangan) tersedia beserta ruangnya
      const rawBuildings = await allRows(
        queryInterface,
        "SELECT * FROM gedung ORDER BY id ASC",
        {},
        t,
      );
      const buildings = rawBuildings.filter((r) => !r.deletedAt);
      const buildingByKode = new Map(rawBuildings.map((b) => [b.kode, b.id]));
      for (const kode of ["F", "G", "H"]) {
        if (!buildingByKode.has(kode)) {
          const id = randomUUID();
          buildingByKode.set(kode, id);
          const newBld = {
            id,
            kode,
            nama: `Gedung ${kode}`,
            alamat: `Kampus Limau Manis, Blok ${kode}, Padang`,
            createdAt: now,
            updatedAt: now,
          };
          await queryInterface.bulkInsert("gedung", [newBld], { transaction: t });
          buildings.push(newBld);
        }
      }

      const mainBuildings = [buildingByKode.get("F"), buildingByKode.get("G")].filter(Boolean);
      const backupBuildings = [buildingByKode.get("H")].filter(Boolean);
      const allowedBuildingIds = [...mainBuildings, ...backupBuildings];

      const rawRooms = await allRows(
        queryInterface,
        "SELECT * FROM ruang ORDER BY id ASC",
        {},
        t,
      );
      let allRooms = rawRooms.filter((r) => !r.deletedAt);
      for (const kode of ["F", "G", "H"]) {
        const gId = buildingByKode.get(kode);
        const existingInBld = allRooms.filter((r) => r.gedung_id === gId && Number(r.kapasitas) >= 40);
        if (existingInBld.length < 4) {
          const newRooms = [];
          for (let n = 1; n <= 4; n++) {
            const rKode = `R.${kode}-10${n}`;
            if (rawRooms.some((r) => r.kode === rKode)) continue;
            newRooms.push({
              id: randomUUID(),
              gedung_id: gId,
              kode: rKode,
              nama: `Ruang Kuliah Gedung ${kode} 10${n}`,
              kapasitas: 50,
              createdAt: now,
              updatedAt: now,
            });
          }
          if (newRooms.length) {
            await queryInterface.bulkInsert("ruang", newRooms, { transaction: t });
            allRooms = [...allRooms, ...newRooms];
          }
        }
      }

      // 4. Pastikan seluruh jadwal_kelas pada semester ini memiliki ruang_id, jam_mulai, jam_selesai valid
      const fallbackRoomId = allRooms[0]?.id;
      if (fallbackRoomId) {
        await queryInterface.sequelize.query(
          `UPDATE jadwal_kelas jk
           INNER JOIN kelas k ON k.id = jk.kelas_id
           SET
             jk.ruang_id = COALESCE(jk.ruang_id, :fallbackRoomId),
             jk.jam_mulai = COALESCE(jk.jam_mulai, '08:00:00'),
             jk.jam_selesai = COALESCE(jk.jam_selesai, '09:40:00')
           WHERE k.semester_id = :semesterId
             AND (jk.ruang_id IS NULL OR jk.jam_mulai IS NULL OR jk.jam_selesai IS NULL)`,
          { replacements: { fallbackRoomId, semesterId }, transaction: t },
        );
      }

      // 5. Pastikan kelas-kelas FTI pada semester aktif memiliki kapasitas valid (1..45) dan dosen pengampu
      const rawPrograms = await allRows(
        queryInterface,
        "SELECT * FROM program_studi ORDER BY id ASC",
        {},
        t,
      );
      const programs = rawPrograms.filter((r) => !r.deletedAt);
      const ftiProdis = programs.filter((p) => p.fakultas_id === fakultasId);
      const ftiProdiIds = ftiProdis.map((p) => p.id);
      if (!ftiProdiIds.length) return;

      await queryInterface.sequelize.query(
        `UPDATE kelas
         SET jumlah_peserta_max = 40
         WHERE semester_id = :semesterId
           AND program_studi_id IN (:prodiIds)
           AND (jumlah_peserta_max IS NULL OR jumlah_peserta_max <= 0 OR jumlah_peserta_max > 50)`,
        { replacements: { semesterId, prodiIds: ftiProdiIds }, transaction: t },
      );

      const rawClasses = await allRows(
        queryInterface,
        "SELECT * FROM kelas WHERE semester_id = :semesterId ORDER BY id ASC",
        { semesterId },
        t,
      );
      const classes = rawClasses.filter((r) => !r.deletedAt);
      const ftiClasses = classes.filter((c) => ftiProdiIds.includes(c.program_studi_id));
      if (!ftiClasses.length) return;

      const allClassIds = classes.map((c) => c.id);
      let teachers = allClassIds.length
        ? await allRows(
            queryInterface,
            "SELECT * FROM dosen_kelas WHERE kelas_id IN (:classIds) ORDER BY id ASC",
            { classIds: allClassIds },
            t,
          )
        : [];

      const taughtClassIds = new Set(teachers.map((r) => r.kelas_id));
      const untaughtClasses = ftiClasses.filter((c) => !taughtClassIds.has(c.id));
      if (untaughtClasses.length) {
        const rawLecturers = await allRows(
          queryInterface,
          "SELECT * FROM dosen ORDER BY id ASC LIMIT 50",
          {},
          t,
        );
        const lecturers = rawLecturers.filter((r) => !r.deletedAt);
        if (lecturers.length) {
          const teacherInserts = untaughtClasses.map((c, idx) => ({
            id: randomUUID(),
            kelas_id: c.id,
            dosen_id: lecturers[idx % lecturers.length].id,
            dosen_ke: 1,
            createdAt: now,
            updatedAt: now,
          }));
          await queryInterface.bulkInsert("dosen_kelas", teacherInserts, { transaction: t });
          teachers = [...teachers, ...teacherInserts];
        }
      }

      // 6. Susun konfigurasi Policy Gedung Utama (F, G) & Cadangan (H) untuk FTI
      const policyRooms = [];
      for (const bId of allowedBuildingIds) {
        const bRooms = allRooms
          .filter((r) => r.gedung_id === bId && Number(r.kapasitas) >= 40)
          .slice(0, 15);
        for (const r of bRooms) {
          policyRooms.push({
            id: r.id,
            type: "teori",
            facilities: ["proyektor"],
            zone: "Limau Manis",
          });
        }
      }

      const travel = [];
      for (let i = 0; i < buildings.length; i++) {
        for (let j = 0; j < buildings.length; j++) {
          if (i === j) continue;
          travel.push({
            from: buildings[i].id,
            to: buildings[j].id,
            minutes: 15,
          });
        }
      }

      const policyConfig = {
        main_buildings: mainBuildings,
        backup_buildings: backupBuildings,
        rooms: policyRooms,
        travel,
        unavailable: [],
        reservations: [],
      };

      const rawExistingPolicies = await allRows(
        queryInterface,
        "SELECT * FROM penjadwalan_policy WHERE semester_id = :semesterId AND fakultas_id = :fakultasId",
        { semesterId, fakultasId },
        t,
      );
      const existingPolicies = rawExistingPolicies.filter((r) => !r.deletedAt);
      if (existingPolicies.length) {
        await queryInterface.bulkUpdate(
          "penjadwalan_policy",
          { config: JSON.stringify(policyConfig), updatedAt: now },
          { id: existingPolicies[0].id },
          { transaction: t },
        );
      } else {
        await queryInterface.bulkInsert(
          "penjadwalan_policy",
          [
            {
              id: randomUUID(),
              semester_id: semesterId,
              fakultas_id: fakultasId,
              config: JSON.stringify(policyConfig),
              createdAt: now,
              updatedAt: now,
            },
          ],
          { transaction: t },
        );
      }

      // 7. Susun sesi dan slot waktu untuk seluruh kelas FTI pada semester aktif
      const mks = await allRows(
        queryInterface,
        "SELECT id, kode_matakuliah, semester_kurikulum FROM matakuliah",
        {},
        t,
      );
      const mkById = new Map(mks.map((m) => [m.id, m]));
      const prodiById = new Map(ftiProdis.map((p) => [p.id, p]));

      const sessions = ftiClasses.map((c, idx) => {
        const mk = mkById.get(c.matakuliah_id);
        const prodi = prodiById.get(c.program_studi_id);
        const semKur = mk?.semester_kurikulum || ((idx % 4) * 2 + 1);
        const groupName = `${prodi?.kode_prodi || "FTI"}-S${semKur}-${c.nama}`;
        return {
          id: `sesi_${idx + 1}_${String(c.id).slice(0, 8)}`,
          kelas_id: c.id,
          duration: 100,
          frekuensi: "Mingguan",
          groups: [groupName],
          type: "teori",
          facilities: ["proyektor"],
          lock_room: false,
          lock_time: false,
        };
      });

      const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
      const startTimes = ["08:00", "10:00", "13:00", "15:00"];
      const slots = days.flatMap((hari) =>
        startTimes.map((jam_mulai) => ({
          hari,
          jam_mulai,
          jam_selesai: "17:30",
          frekuensi: "Mingguan",
        })),
      );

      const mainRoomIds = policyRooms
        .filter((pr) => {
          const roomObj = allRooms.find((r) => r.id === pr.id);
          return roomObj && mainBuildings.includes(roomObj.gedung_id);
        })
        .map((pr) => pr.id);

      const add100Min = (hhmm) => {
        const [h, m] = hhmm.split(":").map(Number);
        const tot = h * 60 + m + 100;
        return `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
      };

      const baseline = mainRoomIds.length
        ? sessions.map((s, idx) => {
            const slot = slots[idx % slots.length];
            const rId = mainRoomIds[Math.floor(idx / slots.length) % mainRoomIds.length];
            return {
              session_id: s.id,
              ruang_id: rId,
              hari: slot.hari,
              jam_mulai: slot.jam_mulai,
              jam_selesai: add100Min(slot.jam_mulai),
              frekuensi: "Mingguan",
            };
          })
        : [];

      const scenarioInput = {
        sessions,
        slots,
        baseline,
        max_seconds: 30,
      };

      const superadmins = await allRows(
        queryInterface,
        "SELECT id FROM users WHERE email = 'superadmin@email.com' LIMIT 1",
        {},
        t,
      );
      const creatorId = superadmins[0]?.id || null;

      await queryInterface.bulkDelete(
        "penjadwalan_scenario",
        {
          semester_id: semesterId,
          fakultas_id: fakultasId,
          nama: [SCENARIO_SOLVED_NAME, SCENARIO_DRAFT_NAME],
        },
        { transaction: t },
      );

      // 8. Bangun snapshot murni & jalankan solver untuk Skenario #1 (Solved & Siap Tinjau/Publikasi)
      const schedules = allClassIds.length
        ? await allRows(
            queryInterface,
            "SELECT * FROM jadwal_kelas WHERE kelas_id IN (:classIds) ORDER BY id ASC",
            { classIds: allClassIds },
            t,
          )
        : [];
      const rawPolicies = await allRows(
        queryInterface,
        "SELECT * FROM penjadwalan_policy WHERE semester_id = :semesterId ORDER BY id ASC",
        { semesterId },
        t,
      );
      const policies = rawPolicies
        .filter((p) => !p.deletedAt)
        .map((p) => ({
          ...p,
          config: typeof p.config === "string" ? JSON.parse(p.config) : p.config,
        }));
      const source = {
        semester,
        classes,
        programs,
        rooms: allRooms,
        buildings,
        teachers,
        schedules,
        policies,
      };
      const { snapshot, source_hash } = makeSnapshot(source, {
        semester_id: semesterId,
        fakultas_id: fakultasId,
        input: scenarioInput,
      });

      let solvedResult = null;
      try {
        const problem = buildProblem(snapshot);
        const proc = spawnSync(config.python, [config.solverPath], {
          input: JSON.stringify(problem),
          encoding: "utf8",
          timeout: 25000,
          windowsHide: true,
        });
        if (proc.status === 0 && proc.stdout) {
          const parsed = JSON.parse(proc.stdout);
          if (
            ["OPTIMAL", "FEASIBLE"].includes(parsed.status) &&
            validateAssignments(snapshot, parsed.assignments).length === 0
          ) {
            const changes = comparison(snapshot, parsed.assignments);
            solvedResult = {
              ...parsed,
              objective_order: snapshot.objective_order,
              validation: [],
              comparison: changes,
              metrics: {
                candidate_count: problem.sessions.reduce((n, s) => n + s.candidates.length, 0),
                conflict_count: problem.conflicts.length,
                solver_seconds: parsed.elapsed_seconds,
                total: changes.length,
                changed: changes.filter((c) => c.changed).length,
                change_percent:
                  Math.round(
                    (changes.filter((c) => c.changed).length / Math.max(1, changes.length)) * 10000,
                  ) / 100,
                backup: changes.filter((c) => c.backup).length,
              },
            };
          }
        }
      } catch (_err) {
        solvedResult = null;
      }

      const scenariosToInsert = [];
      if (solvedResult) {
        scenariosToInsert.push({
          id: randomUUID(),
          nama: SCENARIO_SOLVED_NAME,
          semester_id: semesterId,
          fakultas_id: fakultasId,
          revision: 2,
          status: "solved",
          input: JSON.stringify(scenarioInput),
          snapshot: JSON.stringify(snapshot),
          source_hash,
          result: JSON.stringify(solvedResult),
          decisions: JSON.stringify([
            {
              revision: 2,
              action: "review",
              approved: true,
              note: "Jadwal telah ditinjau oleh Fakultas Teknologi Informasi (Gedung F & G).",
              user_id: creatorId,
              at: now.toISOString(),
            },
          ]),
          created_by: creatorId,
          createdAt: now,
          updatedAt: now,
        });
      }

      scenariosToInsert.push({
        id: randomUUID(),
        nama: SCENARIO_DRAFT_NAME,
        semester_id: semesterId,
        fakultas_id: fakultasId,
        revision: 1,
        status: "draft",
        input: JSON.stringify(scenarioInput),
        snapshot: null,
        source_hash: null,
        result: null,
        decisions: JSON.stringify([]),
        created_by: creatorId,
        createdAt: now,
        updatedAt: now,
      });

      await queryInterface.bulkInsert("penjadwalan_scenario", scenariosToInsert, {
        transaction: t,
      });
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("penjadwalan_scenario", {
      nama: [SCENARIO_SOLVED_NAME, SCENARIO_DRAFT_NAME],
    });
  },
};

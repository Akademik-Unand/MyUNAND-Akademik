"use strict";

const { randomUUID } = require("crypto");
const { PRODI } = require("./data/obeDummyCatalog");

const allRows = async (queryInterface, sql, replacements = {}, transaction) => {
  const [rows] = await queryInterface.sequelize.query(sql, {
    replacements,
    transaction,
  });
  return rows;
};

const mapBy = (rows, key) =>
  Object.fromEntries(rows.map((item) => [item[key], item.id]));

const requireId = (value, label) => {
  if (!value)
    throw new Error(
      `Seeder OBE dummy butuh ${label}. Jalankan seeder master akademik (002) dulu.`,
    );
  return value;
};

const row = (now, extra) => ({
  id: randomUUID(),
  createdAt: now,
  updatedAt: now,
  ...extra,
});

const chunkInsert = async (
  queryInterface,
  table,
  rows,
  transaction,
  size = 150,
) => {
  for (let i = 0; i < rows.length; i += size) {
    const slice = rows.slice(i, i + size);
    if (slice.length)
      await queryInterface.bulkInsert(table, slice, { transaction });
  }
};

const oddSemester = (semester) => semester % 2 === 1;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.sequelize.transaction(async (t) => {
      const jenisByNama = mapBy(
        await allRows(
          queryInterface,
          "SELECT id, nama FROM jenis_semester",
          {},
          t,
        ),
        "nama",
      );
      const ganjilId = requireId(jenisByNama.Ganjil, "jenis semester Ganjil");
      const genapId = requireId(jenisByNama.Genap, "jenis semester Genap");
      const sifatByKode = mapBy(
        await allRows(
          queryInterface,
          "SELECT id, kode_sifat_matakuliah AS kode FROM sifat_matakuliah",
          {},
          t,
        ),
        "kode",
      );
      const tipeByKode = mapBy(
        await allRows(
          queryInterface,
          "SELECT id, kode_tipe_matakuliah AS kode FROM tipe_matakuliah",
          {},
          t,
        ),
        "kode",
      );

      for (const prodi of PRODI) {
        const prodiRow = requireId(
          (
            await allRows(
              queryInterface,
              "SELECT id FROM program_studi WHERE kode_prodi = :kode LIMIT 1",
              { kode: prodi.kode },
              t,
            )
          )[0],
          `prodi ${prodi.kode}`,
        );
        const prodiId = prodiRow.id;

        const kurikulumExisting = (
          await allRows(
            queryInterface,
            "SELECT id FROM kurikulum WHERE program_studi_id = :prodi AND tahun = :tahun AND nama = :nama LIMIT 1",
            {
              prodi: prodiId,
              tahun: prodi.kurikulum.tahun,
              nama: prodi.kurikulum.nama,
            },
            t,
          )
        )[0];
        let kurikulumId = kurikulumExisting?.id;
        if (!kurikulumId) {
          kurikulumId = randomUUID();
          await queryInterface.bulkInsert(
            "kurikulum",
            [
              row(now, {
                id: kurikulumId,
                program_studi_id: prodiId,
                tahun: prodi.kurikulum.tahun,
                nama: prodi.kurikulum.nama,
                masa_studi_ideal: prodi.kurikulum.masaStudiIdeal,
                masa_studi_maksimal: prodi.kurikulum.masaStudiMaksimal,
              }),
            ],
            { transaction: t },
          );
        }

        const mkByKode = mapBy(
          await allRows(
            queryInterface,
            "SELECT id, kode_matakuliah FROM matakuliah",
            {},
            t,
          ),
          "kode_matakuliah",
        );
        const mkInserts = [];
        for (const item of prodi.matakuliah) {
          if (mkByKode[item.kode]) continue;
          const id = randomUUID();
          mkByKode[item.kode] = id;
          mkInserts.push(
            row(now, {
              id,
              program_studi_id: prodiId,
              jenis_semester_id: oddSemester(item.semester)
                ? ganjilId
                : genapId,
              tipe_matakuliah_id: item.prak > 0 ? tipeByKode.P : tipeByKode.T,
              sifat_matakuliah_id:
                item.status === "Pilihan" ? sifatByKode.P : sifatByKode.W,
              kode_matakuliah: item.kode,
              nama_resmi: item.nama,
              semester_kurikulum: item.semester,
              jumlah_sks_kurikulum: item.sks,
              jumlah_sks_teori: item.teori,
              jumlah_sks_praktikum: item.prak,
              bobot_nilai_minimal_lulus: 2,
              has_prasyarat: item.semester >= 3,
            }),
          );
        }
        await chunkInsert(queryInterface, "matakuliah", mkInserts, t);

        const mkKurikulumPairs = new Set(
          (
            await allRows(
              queryInterface,
              "SELECT matakuliah_id FROM matakuliah_kurikulum WHERE kurikulum_id = :kur",
              { kur: kurikulumId },
              t,
            )
          ).map((item) => String(item.matakuliah_id)),
        );
        const mkKurikulumInserts = [];
        for (const item of prodi.matakuliah) {
          const mkId = mkByKode[item.kode];
          if (!mkId || mkKurikulumPairs.has(String(mkId))) continue;
          mkKurikulumPairs.add(String(mkId));
          mkKurikulumInserts.push(
            row(now, {
              kurikulum_id: kurikulumId,
              matakuliah_id: mkId,
              status: item.status,
            }),
          );
        }
        await chunkInsert(
          queryInterface,
          "matakuliah_kurikulum",
          mkKurikulumInserts,
          t,
        );

        const existingCp = await allRows(
          queryInterface,
          "SELECT id, nama_cp FROM cp WHERE kurikulum_id = :kur",
          { kur: kurikulumId },
          t,
        );
        const cpByNama = mapBy(existingCp, "nama_cp");
        const existingScp = await allRows(
          queryInterface,
          `SELECT scp.id, scp.nama_scp, scp.cp_id
           FROM scp
           INNER JOIN cp ON cp.id = scp.cp_id
           WHERE cp.kurikulum_id = :kur`,
          { kur: kurikulumId },
          t,
        );
        const scpByName = new Map(
          existingScp.map((item) => [
            `${item.cp_id}::${item.nama_scp}`,
            item.id,
          ]),
        );
        const scpByKey = {};
        const cpRows = [];
        const scpRows = [];
        for (const group of prodi.cp) {
          let cpId = cpByNama[group.nama];
          if (!cpId) {
            cpId = randomUUID();
            cpByNama[group.nama] = cpId;
            cpRows.push(
              row(now, {
                id: cpId,
                kurikulum_id: kurikulumId,
                nama_cp: group.nama,
                deskripsi: group.deskripsi,
                nilai_max: 100,
                nilai_min: 60,
              }),
            );
          }
          for (const s of group.scp) {
            const key = `${cpId}::${s.nama}`;
            let scpId = scpByName.get(key);
            if (!scpId) {
              scpId = randomUUID();
              scpByName.set(key, scpId);
              scpRows.push(
                row(now, {
                  id: scpId,
                  cp_id: cpId,
                  nama_scp: s.nama,
                  deskripsi: s.nama,
                  persen_capai_nilai_min: 65,
                  nilai_min: 60,
                }),
              );
            }
            scpByKey[s.key] = scpId;
          }
        }
        await chunkInsert(queryInterface, "cp", cpRows, t);
        await chunkInsert(queryInterface, "scp", scpRows, t);

        const prodiMkIds = prodi.matakuliah
          .map((item) => mkByKode[item.kode])
          .filter(Boolean);
        const existingCpmk = prodiMkIds.length
          ? await allRows(
              queryInterface,
              "SELECT id, nama_cpmk, matakuliah_id FROM cpmk WHERE matakuliah_id IN (:ids)",
              { ids: prodiMkIds },
              t,
            )
          : [];
        const cpmkByKey = new Map(
          existingCpmk.map((item) => [
            `${item.matakuliah_id}::${item.nama_cpmk}`,
            item.id,
          ]),
        );
        const scpIds = Object.values(scpByKey);
        const mappingExisting = new Set(
          scpIds.length
            ? (
                await allRows(
                  queryInterface,
                  "SELECT scp_id, cpmk_id FROM cpmk_scp WHERE scp_id IN (:ids)",
                  { ids: scpIds },
                  t,
                )
              ).map((item) => `${item.scp_id}:${item.cpmk_id}`)
            : [],
        );
        const cpmkRows = [];
        const mapRows = [];
        const ensureCpmk = (matakuliahId, nama, parentId = null) => {
          const key = `${matakuliahId}::${nama}`;
          if (cpmkByKey.has(key)) return cpmkByKey.get(key);
          const id = randomUUID();
          cpmkByKey.set(key, id);
          cpmkRows.push(
            row(now, {
              id,
              matakuliah_id: matakuliahId,
              parent_cpmk_id: parentId,
              nama_cpmk: nama,
              deskripsi: nama,
            }),
          );
          return id;
        };
        const addMap = (cpmkId, scpKeys) => {
          for (const keyValue of scpKeys) {
            const scpId = scpByKey[keyValue];
            if (!scpId || mappingExisting.has(`${scpId}:${cpmkId}`)) continue;
            mappingExisting.add(`${scpId}:${cpmkId}`);
            mapRows.push(row(now, { scp_id: scpId, cpmk_id: cpmkId }));
          }
        };

        const counters = {};
        for (const spec of prodi.cpmk) {
          const mkId = mkByKode[spec.mk];
          if (!mkId) continue;
          counters[spec.mk] = (counters[spec.mk] || 0) + 1;
          const n = counters[spec.mk];
          const parentId = ensureCpmk(mkId, `[${spec.mk}] CPMK ${n}`);
          if (spec.hasSub) {
            spec.scp.forEach((scpKeyValue, index) => {
              const subId = ensureCpmk(
                mkId,
                `[${spec.mk}] Sub-CPMK ${n}.${index + 1}`,
                parentId,
              );
              addMap(subId, [scpKeyValue]);
            });
          } else {
            addMap(parentId, spec.scp);
          }
        }
        await chunkInsert(queryInterface, "cpmk", cpmkRows, t);
        await chunkInsert(queryInterface, "cpmk_scp", mapRows, t);
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (t) => {
      for (const prodi of PRODI) {
        const kodes = prodi.matakuliah.map((item) => item.kode);
        const prodiRow = (
          await allRows(
            queryInterface,
            "SELECT id FROM program_studi WHERE kode_prodi = :kode LIMIT 1",
            { kode: prodi.kode },
            t,
          )
        )[0];
        if (!prodiRow) continue;
        const kurikulumRow = (
          await allRows(
            queryInterface,
            "SELECT id FROM kurikulum WHERE program_studi_id = :prodi AND tahun = :tahun AND nama = :nama LIMIT 1",
            {
              prodi: prodiRow.id,
              tahun: prodi.kurikulum.tahun,
              nama: prodi.kurikulum.nama,
            },
            t,
          )
        )[0];
        const mkRows = await allRows(
          queryInterface,
          "SELECT id FROM matakuliah WHERE kode_matakuliah IN (:kodes)",
          { kodes },
          t,
        );
        const mkIds = mkRows.map((item) => item.id);
        if (!mkIds.length) continue;

        await queryInterface.sequelize.query(
          `DELETE nm FROM nilai_mahasiswa nm
           INNER JOIN krs_detil kd ON kd.id = nm.krs_detil_id
           INNER JOIN kelas k ON k.id = kd.kelas_id
           INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
           WHERE mk.kode_matakuliah IN (:kodes)`,
          { replacements: { kodes }, transaction: t },
        );
        await queryInterface.sequelize.query(
          `DELETE kd FROM krs_detil kd
           INNER JOIN kelas k ON k.id = kd.kelas_id
           INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
           WHERE mk.kode_matakuliah IN (:kodes)`,
          { replacements: { kodes }, transaction: t },
        );
        await queryInterface.sequelize.query(
          `DELETE dj FROM dosen_jadwal dj
           INNER JOIN jadwal_kelas jk ON jk.id = dj.jadwal_kelas_id
           INNER JOIN kelas k ON k.id = jk.kelas_id
           INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
           WHERE mk.kode_matakuliah IN (:kodes)`,
          { replacements: { kodes }, transaction: t },
        );
        await queryInterface.sequelize.query(
          `DELETE jk FROM jadwal_kelas jk
           INNER JOIN kelas k ON k.id = jk.kelas_id
           INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
           WHERE mk.kode_matakuliah IN (:kodes)`,
          { replacements: { kodes }, transaction: t },
        );
        await queryInterface.sequelize.query(
          `DELETE dk FROM dosen_kelas dk
           INNER JOIN kelas k ON k.id = dk.kelas_id
           INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
           WHERE mk.kode_matakuliah IN (:kodes)`,
          { replacements: { kodes }, transaction: t },
        );
        await queryInterface.sequelize.query(
          `DELETE k FROM kelas k
           INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
           WHERE mk.kode_matakuliah IN (:kodes)`,
          { replacements: { kodes }, transaction: t },
        );

        const cpmkRows = await allRows(
          queryInterface,
          "SELECT id, parent_cpmk_id FROM cpmk WHERE matakuliah_id IN (:ids)",
          { ids: mkIds },
          t,
        );
        const cpmkIds = cpmkRows.map((item) => item.id);
        if (cpmkIds.length) {
          await queryInterface.bulkDelete(
            "sumber_penilaian",
            { cpmk_id: cpmkIds },
            { transaction: t },
          );
          await queryInterface.bulkDelete(
            "cpmk_scp",
            { cpmk_id: cpmkIds },
            { transaction: t },
          );
          const children = cpmkRows
            .filter((item) => item.parent_cpmk_id != null)
            .map((item) => item.id);
          if (children.length) {
            await queryInterface.bulkDelete(
              "cpmk",
              { id: children },
              { transaction: t },
            );
          }
          const parents = cpmkIds.filter((id) => !children.includes(id));
          if (parents.length) {
            await queryInterface.bulkDelete(
              "cpmk",
              { id: parents },
              { transaction: t },
            );
          }
        }

        if (kurikulumRow) {
          const cpRows = await allRows(
            queryInterface,
            "SELECT id FROM cp WHERE kurikulum_id = :kur",
            { kur: kurikulumRow.id },
            t,
          );
          const cpIds = cpRows.map((item) => item.id);
          const scpNames = prodi.cp.flatMap((group) =>
            group.scp.map((s) => s.nama),
          );
          if (cpIds.length && scpNames.length) {
            const scpTargets = await allRows(
              queryInterface,
              "SELECT id FROM scp WHERE cp_id IN (:ids) AND nama_scp IN (:names)",
              { ids: cpIds, names: scpNames },
              t,
            );
            for (const part of chunk(
              scpTargets.map((item) => item.id),
              150,
            ))
              if (part.length)
                await queryInterface.bulkDelete(
                  "scp",
                  { id: part },
                  { transaction: t },
                );
          }
          const cpNames = prodi.cp.map((group) => group.nama);
          if (cpNames.length) {
            await queryInterface.bulkDelete(
              "cp",
              { kurikulum_id: kurikulumRow.id, nama_cp: cpNames },
              { transaction: t },
            );
          }

          await queryInterface.bulkDelete(
            "matakuliah_kurikulum",
            { kurikulum_id: kurikulumRow.id, matakuliah_id: mkIds },
            { transaction: t },
          );

          if (prodi.kurikulum.created && !prodi.kurikulum.reuseExisting) {
            await queryInterface.bulkDelete(
              "kurikulum",
              { id: kurikulumRow.id },
              { transaction: t },
            );
          }
        }

        await queryInterface.bulkDelete(
          "matakuliah",
          { kode_matakuliah: kodes },
          { transaction: t },
        );
      }
    });
  },
};

function chunk(rows, size = 150) {
  return Array.from({ length: Math.ceil(rows.length / size) }, (_, i) =>
    rows.slice(i * size, (i + 1) * size),
  );
}

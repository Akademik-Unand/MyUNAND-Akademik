"use strict";

const { randomUUID } = require("crypto");

const row = (now, extra) => ({
  id: randomUUID(),
  createdAt: now,
  updatedAt: now,
  ...extra,
});

const chunkInsert = async (queryInterface, table, rows, size = 150) => {
  for (let i = 0; i < rows.length; i += size) {
    const slice = rows.slice(i, i + size);
    if (slice.length) await queryInterface.bulkInsert(table, slice);
  }
};

const allRows = async (queryInterface, sql, replacements = {}) => {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  return rows;
};

const mapBy = (rows, key) =>
  Object.fromEntries(rows.map((item) => [item[key], item.id]));

const requireId = (value, label) => {
  if (!value)
    throw new Error(`Seeder peternakan semester-kelas butuh ${label}.`);
  return value;
};

const oddSemester = (semester) => semester % 2 === 1;

const DOSEN_PTN = [
  {
    nip: "197801011990031010",
    nidn: "0001017810",
    nama: "Prof. Dr. H. Suhendar, S.Pt., M.P.",
  },
  {
    nip: "198002021995032011",
    nidn: "0002028011",
    nama: "Dr. Rina Marlina, S.Pt., M.P.",
  },
  {
    nip: "198103031998031012",
    nidn: "0003038112",
    nama: "Dr. Ahmad Fauzi, S.Pt., M.P.",
  },
  {
    nip: "198204042000032013",
    nidn: "0004048213",
    nama: "Dewi Kartika, S.Pt., M.P.",
  },
  {
    nip: "198305052001031014",
    nidn: "0005058314",
    nama: "Ir. Bambang Purwanto, M.P.",
  },
  {
    nip: "198406062002032015",
    nidn: "0006068415",
    nama: "Siti Nurhaliza, S.Pt., M.P.",
  },
];

const DOSEN_NTP = [
  {
    nip: "197907071990031016",
    nidn: "0007077916",
    nama: "Dr. Ir. Joko Widodo, M.P.",
  },
  {
    nip: "198008081993032017",
    nidn: "0008088017",
    nama: "Ratna Sari, S.Pt., M.P.",
  },
];

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const JAM = [
  ["08:00:00", "09:40:00"],
  ["10:00:00", "11:40:00"],
  ["13:00:00", "14:40:00"],
  ["15:00:00", "16:40:00"],
];

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
      "prodi Peternakan (54231)",
    ).id;
    const prodiNtp = requireId(
      (
        await allRows(
          queryInterface,
          "SELECT id FROM program_studi WHERE kode_prodi = '54240' LIMIT 1",
        )
      )[0],
      "prodi NTP (54240)",
    ).id;

    const jenisByNama = mapBy(
      await allRows(queryInterface, "SELECT id, nama FROM jenis_semester"),
      "nama",
    );
    const ganjilId = requireId(jenisByNama.Ganjil, "jenis semester Ganjil");
    const genapId = requireId(jenisByNama.Genap, "jenis semester Genap");

    const semesterGanjil = requireId(
      (
        await allRows(
          queryInterface,
          "SELECT id FROM semester WHERE tahun = 2024 AND jenis_semester_id = :jenis LIMIT 1",
          { jenis: ganjilId },
        )
      )[0],
      "semester 2024 Ganjil",
    ).id;
    let semesterGenap = (
      await allRows(
        queryInterface,
        "SELECT id FROM semester WHERE tahun = 2025 AND jenis_semester_id = :jenis LIMIT 1",
        { jenis: genapId },
      )
    )[0]?.id;
    if (!semesterGenap) {
      semesterGenap = randomUUID();
      await queryInterface.bulkInsert("semester", [
        row(now, {
          id: semesterGenap,
          jenis_semester_id: genapId,
          tahun: 2025,
          tanggal_mulai: "2025-01-20",
          tanggal_selesai: "2025-05-30",
          is_aktif: false,
        }),
      ]);
    }

    // Kuota SKS kini menempel pada program studi (bukan pivot semester-prodi).
    await queryInterface.bulkUpdate(
      "program_studi",
      { sks_default: 18, sks_maksimal: 24, updatedAt: now },
      { id: [prodiPtn, prodiNtp] },
    );

    const semProdiPtnGanjil = {
      semester_id: semesterGanjil,
      program_studi_id: prodiPtn,
    };
    const semProdiPtnGenap = {
      semester_id: semesterGenap,
      program_studi_id: prodiPtn,
    };
    const semProdiNtpGanjil = {
      semester_id: semesterGanjil,
      program_studi_id: prodiNtp,
    };
    const semProdiNtpGenap = {
      semester_id: semesterGenap,
      program_studi_id: prodiNtp,
    };

    const mkByKode = mapBy(
      await allRows(
        queryInterface,
        "SELECT id, kode_matakuliah FROM matakuliah",
      ),
      "kode_matakuliah",
    );

    const kelasExisting = await allRows(
      queryInterface,
      "SELECT id, semester_id, program_studi_id, matakuliah_id, nama FROM kelas",
    );
    const kelasKey = (semesterId, programStudiId, mkId, nama) =>
      `${semesterId}:${programStudiId}:${mkId}:${nama}`;
    const kelasByKey = Object.fromEntries(
      kelasExisting.map((item) => [
        kelasKey(
          item.semester_id,
          item.program_studi_id,
          item.matakuliah_id,
          item.nama,
        ),
        item.id,
      ]),
    );
    const kelasRows = [];
    const kelasMeta = [];

    const PTN_MK = [
      "PTN1101",
      "PTN1102",
      "PTN1103",
      "PTN1104",
      "PTN1105",
      "PTN1201",
      "PTN1202",
      "PTN1203",
      "PTN1204",
      "PTN1205",
      "PTN2101",
      "PTN2102",
      "PTN2103",
      "PTN2104",
      "PTN2105",
      "PTN2201",
      "PTN2202",
      "PTN2203",
      "PTN2204",
      "PTN3101",
      "PTN3102",
      "PTN3103",
      "PTN3104",
      "PTN3201",
      "PTN3202",
      "PTN3203",
      "PTN4101",
      "PTN4102",
      "PTN4201",
    ];
    const NTP_MK = [
      "NT1101",
      "NT1102",
      "NT1103",
      "NT1104",
      "NT1105",
      "NT1201",
      "NT1202",
      "NT1203",
      "NT1204",
      "NT2101",
      "NT2102",
      "NT2103",
      "NT2104",
      "NT2201",
      "NT2202",
      "NT2203",
      "NT2204",
      "NT3101",
      "NT3102",
      "NT3103",
      "NT3104",
      "NT3201",
      "NT3202",
      "NT3203",
      "NT4101",
      "NT4102",
      "NT4201",
    ];

    const mkSemesterMap = {
      PTN1101: 1,
      PTN1102: 1,
      PTN1103: 1,
      PTN1104: 1,
      PTN1105: 1,
      PTN1201: 2,
      PTN1202: 2,
      PTN1203: 2,
      PTN1204: 2,
      PTN1205: 2,
      PTN2101: 3,
      PTN2102: 3,
      PTN2103: 3,
      PTN2104: 3,
      PTN2105: 3,
      PTN2201: 4,
      PTN2202: 4,
      PTN2203: 4,
      PTN2204: 4,
      PTN3101: 5,
      PTN3102: 5,
      PTN3103: 5,
      PTN3104: 5,
      PTN3201: 6,
      PTN3202: 6,
      PTN3203: 6,
      PTN4101: 7,
      PTN4102: 7,
      PTN4201: 8,
      NT1101: 1,
      NT1102: 1,
      NT1103: 1,
      NT1104: 1,
      NT1105: 1,
      NT1201: 2,
      NT1202: 2,
      NT1203: 2,
      NT1204: 2,
      NT2101: 3,
      NT2102: 3,
      NT2103: 3,
      NT2104: 3,
      NT2201: 4,
      NT2202: 4,
      NT2203: 4,
      NT2204: 4,
      NT3101: 5,
      NT3102: 5,
      NT3103: 5,
      NT3104: 5,
      NT3201: 6,
      NT3202: 6,
      NT3203: 6,
      NT4101: 7,
      NT4102: 7,
      NT4201: 8,
    };

    const planKelas = [
      ...PTN_MK.map((kode) => ({
        kode,
        semProdi: oddSemester(mkSemesterMap[kode])
          ? semProdiPtnGanjil
          : semProdiPtnGenap,
        dosenPool: DOSEN_PTN.map((d) => d.nip),
      })),
      ...NTP_MK.map((kode) => ({
        kode,
        semProdi: oddSemester(mkSemesterMap[kode])
          ? semProdiNtpGanjil
          : semProdiNtpGenap,
        dosenPool: DOSEN_NTP.map((d) => d.nip),
      })),
    ];

    let slotIndex = 0;
    for (const plan of planKelas) {
      const mkId = mkByKode[plan.kode];
      if (!mkId) continue;
      const nama = "A";
      const key = kelasKey(
        plan.semProdi.semester_id,
        plan.semProdi.program_studi_id,
        mkId,
        nama,
      );
      let id = kelasByKey[key];
      if (!id) {
        id = randomUUID();
        kelasByKey[key] = id;
        kelasRows.push(
          row(now, {
            id,
            semester_id: plan.semProdi.semester_id,
            program_studi_id: plan.semProdi.program_studi_id,
            matakuliah_id: mkId,
            nama,
            jumlah_peserta_min: 10,
            jumlah_peserta_max: 40,
          }),
        );
      }
      kelasMeta.push({
        id,
        mkId,
        semProdi: plan.semProdi,
        dosenPool: plan.dosenPool,
        slot: slotIndex,
      });
      slotIndex += 1;
    }
    await chunkInsert(queryInterface, "kelas", kelasRows);

    const dosenByNip = mapBy(
      await allRows(queryInterface, "SELECT id, nip FROM dosen"),
      "nip",
    );
    const dosenInserts = [];
    for (const item of [...DOSEN_PTN, ...DOSEN_NTP]) {
      if (dosenByNip[item.nip]) continue;
      const id = randomUUID();
      dosenByNip[item.nip] = id;
      const isPtn = DOSEN_PTN.includes(item);
      dosenInserts.push(
        row(now, {
          id,
          nip: item.nip,
          nidn: item.nidn,
          nama: item.nama,
          program_studi_id: isPtn ? prodiPtn : prodiNtp,
        }),
      );
    }
    await chunkInsert(queryInterface, "dosen", dosenInserts);

    const ruangIds = (
      await allRows(queryInterface, "SELECT id FROM ruang")
    ).map((item) => item.id);

    const dosenKelasExisting = new Set(
      (
        await allRows(
          queryInterface,
          "SELECT dosen_id, kelas_id FROM dosen_kelas",
        )
      ).map((item) => `${item.dosen_id}:${item.kelas_id}`),
    );
    const jadwalExisting = new Set(
      (
        await allRows(
          queryInterface,
          "SELECT kelas_id, hari, jam_mulai FROM jadwal_kelas",
        )
      ).map((item) => `${item.kelas_id}:${item.hari}:${item.jam_mulai}`),
    );
    const dosenKelasRows = [];
    const jadwalRows = [];
    const dosenJadwalRows = [];

    for (const meta of kelasMeta) {
      const dosenNip = meta.dosenPool[meta.slot % meta.dosenPool.length];
      const dosenId = dosenByNip[dosenNip];
      if (!dosenId) continue;

      const dkKey = `${dosenId}:${meta.id}`;
      if (!dosenKelasExisting.has(dkKey)) {
        const dosenKelasId = randomUUID();
        dosenKelasExisting.add(dkKey);
        dosenKelasRows.push(
          row(now, {
            id: dosenKelasId,
            dosen_id: dosenId,
            kelas_id: meta.id,
            dosen_ke: 1,
          }),
        );

        const hari = HARI[meta.slot % HARI.length];
        const [jamMulai, jamSelesai] = JAM[meta.slot % JAM.length];
        const jadwalKey = `${meta.id}:${hari}:${jamMulai}`;
        if (!jadwalExisting.has(jadwalKey)) {
          const jadwalId = randomUUID();
          jadwalExisting.add(jadwalKey);
          jadwalRows.push(
            row(now, {
              id: jadwalId,
              kelas_id: meta.id,
              ruang_id: ruangIds.length
                ? ruangIds[meta.slot % ruangIds.length]
                : null,
              hari,
              jam_mulai: jamMulai,
              jam_selesai: jamSelesai,
            }),
          );
          dosenJadwalRows.push(
            row(now, {
              dosen_kelas_id: dosenKelasId,
              jadwal_kelas_id: jadwalId,
            }),
          );
        }
      }
    }
    await chunkInsert(queryInterface, "dosen_kelas", dosenKelasRows);
    await chunkInsert(queryInterface, "jadwal_kelas", jadwalRows);
    await chunkInsert(queryInterface, "dosen_jadwal", dosenJadwalRows);
  },

  async down(queryInterface) {
    const ptnKodes = [
      "PTN1101",
      "PTN1102",
      "PTN1103",
      "PTN1104",
      "PTN1105",
      "PTN1201",
      "PTN1202",
      "PTN1203",
      "PTN1204",
      "PTN1205",
      "PTN2101",
      "PTN2102",
      "PTN2103",
      "PTN2104",
      "PTN2105",
      "PTN2201",
      "PTN2202",
      "PTN2203",
      "PTN2204",
      "PTN3101",
      "PTN3102",
      "PTN3103",
      "PTN3104",
      "PTN3201",
      "PTN3202",
      "PTN3203",
      "PTN4101",
      "PTN4102",
      "PTN4201",
    ];
    const ntpKodes = [
      "NT1101",
      "NT1102",
      "NT1103",
      "NT1104",
      "NT1105",
      "NT1201",
      "NT1202",
      "NT1203",
      "NT1204",
      "NT2101",
      "NT2102",
      "NT2103",
      "NT2104",
      "NT2201",
      "NT2202",
      "NT2203",
      "NT2204",
      "NT3101",
      "NT3102",
      "NT3103",
      "NT3104",
      "NT3201",
      "NT3202",
      "NT3203",
      "NT4101",
      "NT4102",
      "NT4201",
    ];
    const allKodes = [...ptnKodes, ...ntpKodes];
    const nips = [...DOSEN_PTN, ...DOSEN_NTP].map((item) => item.nip);

    await queryInterface.sequelize.query(
      `DELETE dj FROM dosen_jadwal dj
       INNER JOIN dosen_kelas dk ON dk.id = dj.dosen_kelas_id
       INNER JOIN kelas k ON k.id = dk.kelas_id
       INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)`,
      { replacements: { kodes: allKodes } },
    );
    await queryInterface.sequelize.query(
      `DELETE jk FROM jadwal_kelas jk
       INNER JOIN kelas k ON k.id = jk.kelas_id
       INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)`,
      { replacements: { kodes: allKodes } },
    );
    await queryInterface.sequelize.query(
      `DELETE dk FROM dosen_kelas dk
       INNER JOIN kelas k ON k.id = dk.kelas_id
       INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)`,
      { replacements: { kodes: allKodes } },
    );
    await queryInterface.sequelize.query(
      `DELETE k FROM kelas k
       INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)`,
      { replacements: { kodes: allKodes } },
    );
    await queryInterface.bulkDelete("dosen", { nip: nips });
  },
};

'use strict';

const { randomUUID } = require('crypto');
const catalog = require('./data/demoMappingCatalog');

const row = (now, extra) => ({ id: randomUUID(), createdAt: now, updatedAt: now, ...extra });

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

const mapBy = (rows, key) => Object.fromEntries(rows.map((item) => [item[key], item.id]));

const requireId = (value, label) => {
  if (!value) {
    throw new Error(`Seeder demo mapping butuh ${label}. Jalankan seeder master akademik (002) dulu.`);
  }
  return value;
};

const niuFor = (prodiKode, angkatan, index) => {
  const suffix = String(index + 1).padStart(3, '0');
  return `${String(angkatan).slice(2)}${prodiKode.slice(0, 3)}${suffix}${prodiKode.slice(-2)}`.slice(0, 20);
};

const buildStudents = (count, startIndex, angkatan, prodiId, prodiKode, now) => {
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const index = startIndex + i;
    rows.push(row(now, {
      niu: niuFor(prodiKode, angkatan, index),
      nama: catalog.studentName(index),
      angkatan,
      program_studi_id: prodiId,
      jenis_kelamin: i % 2 === 0 ? 'L' : 'P',
    }));
  }
  return rows;
};

const oddSemester = (semester) => semester % 2 === 1;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const prodiSi = requireId(
      (await allRows(queryInterface, "SELECT id FROM program_studi WHERE kode_prodi = '57201' LIMIT 1"))[0],
      'prodi Sistem Informasi (57201)'
    ).id;
    const prodiMat = requireId(
      (await allRows(queryInterface, "SELECT id FROM program_studi WHERE kode_prodi = '44201' LIMIT 1"))[0],
      'prodi Matematika (44201)'
    ).id;

    const jenisByNama = mapBy(
      await allRows(queryInterface, 'SELECT id, nama FROM jenis_semester'),
      'nama'
    );
    const ganjilId = requireId(jenisByNama.Ganjil, 'jenis semester Ganjil');
    const genapId = requireId(jenisByNama.Genap, 'jenis semester Genap');
    const sifatByKode = mapBy(
      await allRows(queryInterface, 'SELECT id, kode_sifat_matakuliah AS kode FROM sifat_matakuliah'),
      'kode'
    );
    const tipeByKode = mapBy(
      await allRows(queryInterface, 'SELECT id, kode_tipe_matakuliah AS kode FROM tipe_matakuliah'),
      'kode'
    );

    const kurikulumSi = requireId(
      (await allRows(
        queryInterface,
        'SELECT id FROM kurikulum WHERE program_studi_id = :id AND tahun = 2024 LIMIT 1',
        { id: prodiSi }
      ))[0],
      'kurikulum SI 2024'
    ).id;

    const kurikulumMatExisting = (await allRows(
      queryInterface,
      'SELECT id FROM kurikulum WHERE program_studi_id = :id AND tahun = 2024 LIMIT 1',
      { id: prodiMat }
    ))[0];
    let kurikulumMat = kurikulumMatExisting?.id;
    if (!kurikulumMat) {
      kurikulumMat = randomUUID();
      await queryInterface.bulkInsert('kurikulum', [row(now, {
        id: kurikulumMat,
        program_studi_id: prodiMat,
        tahun: 2024,
        nama: 'Kurikulum OBE 2024 Matematika',
        masa_studi_ideal: 8,
        masa_studi_maksimal: 14,
      })]);
    }

    const semesterGanjil = requireId(
      (await allRows(
        queryInterface,
        'SELECT id FROM semester WHERE tahun = 2024 AND jenis_semester_id = :jenis LIMIT 1',
        { jenis: ganjilId }
      ))[0],
      'semester 2024 Ganjil'
    ).id;
    let semesterGenap = (await allRows(
      queryInterface,
      'SELECT id FROM semester WHERE tahun = 2025 AND jenis_semester_id = :jenis LIMIT 1',
      { jenis: genapId }
    ))[0]?.id;
    if (!semesterGenap) {
      semesterGenap = randomUUID();
      await queryInterface.bulkInsert('semester', [row(now, {
        id: semesterGenap,
        jenis_semester_id: genapId,
        tahun: 2025,
        tanggal_mulai: '2025-01-20',
        tanggal_selesai: '2025-05-30',
        is_aktif: false,
      })]);
    }

    const semProdiSiGanjil = requireId(
      (await allRows(
        queryInterface,
        'SELECT id FROM semester_prodi WHERE program_studi_id = :prodi AND semester_id = :semester LIMIT 1',
        { prodi: prodiSi, semester: semesterGanjil }
      ))[0],
      'semester prodi SI 2024 Ganjil'
    ).id;

    const ensureSemProdi = async (prodiId, semesterId, aktif) => {
      const existing = (await allRows(
        queryInterface,
        'SELECT id FROM semester_prodi WHERE program_studi_id = :prodi AND semester_id = :semester LIMIT 1',
        { prodi: prodiId, semester: semesterId }
      ))[0];
      if (existing) return existing.id;
      const id = randomUUID();
      await queryInterface.bulkInsert('semester_prodi', [row(now, {
        id,
        program_studi_id: prodiId,
        semester_id: semesterId,
        is_aktif: aktif,
        tanggal_krs_mulai: '2025-01-02',
        tanggal_krs_selesai: '2025-01-18',
        tanggal_revisi_mulai: '2025-01-19',
        tanggal_revisi_selesai: '2025-01-25',
        sks_default: 18,
        sks_maksimal: 24,
      })]);
      return id;
    };

    const semProdiSiGenap = await ensureSemProdi(prodiSi, semesterGenap, false);
    const semProdiMatGanjil = await ensureSemProdi(prodiMat, semesterGanjil, true);

    const mkByKode = mapBy(
      await allRows(queryInterface, 'SELECT id, kode_matakuliah FROM matakuliah'),
      'kode_matakuliah'
    );
    const mkInserts = [];
    for (const item of [...catalog.SI_MATAKULIAH, ...catalog.MAT_MATAKULIAH]) {
      if (mkByKode[item.kode]) continue;
      const id = randomUUID();
      mkByKode[item.kode] = id;
      mkInserts.push(row(now, {
        id,
        jenis_semester_id: oddSemester(item.semester) ? ganjilId : genapId,
        tipe_matakuliah_id: item.prak ? tipeByKode.P : tipeByKode.T,
        sifat_matakuliah_id: item.status === 'Pilihan' ? sifatByKode.P : sifatByKode.W,
        kode_matakuliah: item.kode,
        nama_resmi: item.nama,
        semester_kurikulum: item.semester,
        jumlah_sks_kurikulum: item.sks,
        jumlah_sks_teori: item.teori,
        jumlah_sks_praktikum: item.prak,
        bobot_nilai_minimal_lulus: 2,
      }));
    }
    await chunkInsert(queryInterface, 'matakuliah', mkInserts);

    const mkKurikulumPairs = new Set(
      (await allRows(queryInterface, 'SELECT kurikulum_id, matakuliah_id FROM matakuliah_kurikulum'))
        .map((item) => `${item.kurikulum_id}:${item.matakuliah_id}`)
    );
    const mkKurikulumInserts = [];
    const linkMk = (kurikulumId, list) => {
      for (const item of list) {
        const mkId = mkByKode[item.kode];
        if (!mkId || mkKurikulumPairs.has(`${kurikulumId}:${mkId}`)) continue;
        mkKurikulumPairs.add(`${kurikulumId}:${mkId}`);
        mkKurikulumInserts.push(row(now, {
          kurikulum_id: kurikulumId,
          matakuliah_id: mkId,
          status: item.status,
        }));
      }
    };
    linkMk(kurikulumSi, [{ kode: 'SI1101', status: 'Wajib' }, { kode: 'SI2103', status: 'Wajib' }, ...catalog.SI_MATAKULIAH]);
    linkMk(kurikulumMat, catalog.MAT_MATAKULIAH);
    await chunkInsert(queryInterface, 'matakuliah_kurikulum', mkKurikulumInserts);

    const cpByNama = mapBy(await allRows(queryInterface, 'SELECT id, nama_cp FROM cp'), 'nama_cp');
    const scpByNama = mapBy(await allRows(queryInterface, 'SELECT id, nama_scp FROM scp'), 'nama_scp');
    const scpByKey = {};
    const insertCpTree = async (kurikulumId, groups) => {
      const cpRows = [];
      const scpRows = [];
      for (const group of groups) {
        let cpId = cpByNama[group.nama];
        if (!cpId) {
          cpId = randomUUID();
          cpByNama[group.nama] = cpId;
          cpRows.push(row(now, {
            id: cpId,
            kurikulum_id: kurikulumId,
            nama_cp: group.nama,
            deskripsi: group.deskripsi,
            nilai_max: 100,
            nilai_min: 60,
          }));
        }
        for (const scp of group.scp) {
          let scpId = scpByNama[scp.nama];
          if (!scpId) {
            scpId = randomUUID();
            scpByNama[scp.nama] = scpId;
            scpRows.push(row(now, {
              id: scpId,
              cp_id: cpId,
              nama_scp: scp.nama,
              deskripsi: scp.nama,
              persen_capai_nilai_min: 65,
              nilai_min: 60,
            }));
          }
          scpByKey[scp.key] = scpId;
        }
      }
      await chunkInsert(queryInterface, 'cp', cpRows);
      await chunkInsert(queryInterface, 'scp', scpRows);
    };
    await insertCpTree(kurikulumSi, catalog.SI_CP);
    await insertCpTree(kurikulumMat, catalog.MAT_CP);

    const cpmkExisting = await allRows(
      queryInterface,
      'SELECT id, nama_cpmk, matakuliah_id FROM cpmk'
    );
    const cpmkKey = (matakuliahId, nama) => `${matakuliahId}::${nama}`;
    const cpmkByKey = Object.fromEntries(cpmkExisting.map((item) => [cpmkKey(item.matakuliah_id, item.nama_cpmk), item.id]));
    const cpmkRows = [];
    const sumberRows = [];
    const mapRows = [];
    const mappingExisting = new Set(
      (await allRows(queryInterface, 'SELECT scp_id, cpmk_id FROM cpmk_scp'))
        .map((item) => `${item.scp_id}:${item.cpmk_id}`)
    );
    const sumberExisting = new Set(
      (await allRows(queryInterface, 'SELECT cpmk_id, nama_sumber_penilaian FROM sumber_penilaian'))
        .map((item) => `${item.cpmk_id}::${item.nama_sumber_penilaian}`)
    );

    const addSumber = (cpmkId, nama, bobot) => {
      if (sumberExisting.has(`${cpmkId}::${nama}`)) return;
      sumberExisting.add(`${cpmkId}::${nama}`);
      sumberRows.push(row(now, { cpmk_id: cpmkId, nama_sumber_penilaian: nama, bobot }));
    };
    const addMap = (cpmkId, scpKeys) => {
      for (const key of scpKeys) {
        const scpId = scpByKey[key];
        if (!scpId || mappingExisting.has(`${scpId}:${cpmkId}`)) continue;
        mappingExisting.add(`${scpId}:${cpmkId}`);
        mapRows.push(row(now, { scp_id: scpId, cpmk_id: cpmkId }));
      }
    };
    const ensureCpmk = (matakuliahId, nama, parentId = null) => {
      const key = cpmkKey(matakuliahId, nama);
      if (cpmkByKey[key]) return cpmkByKey[key];
      const id = randomUUID();
      cpmkByKey[key] = id;
      cpmkRows.push(row(now, {
        id,
        matakuliah_id: matakuliahId,
        parent_cpmk_id: parentId,
        nama_cpmk: nama,
        deskripsi: nama,
      }));
      return id;
    };

    const applyCpmkSpecs = (specs) => {
      const leafCountByMk = {};
      const leafIndexByMk = {};
      for (const spec of specs) {
        if (!mkByKode[spec.mk]) continue;
        leafCountByMk[spec.mk] = (leafCountByMk[spec.mk] || 0) + (spec.hasSub ? spec.scp.length : 1);
      }
      const shareFor = (mkKode) => {
        const n = leafCountByMk[mkKode] || 1;
        const i = leafIndexByMk[mkKode] || 0;
        leafIndexByMk[mkKode] = i + 1;
        const base = Math.round((100 / n) * 10) / 10;
        if (i === n - 1) return Math.round((100 - base * (n - 1)) * 10) / 10;
        return base;
      };
      const splitShare = (share, firstRatio) => {
        const first = Math.round(share * firstRatio * 10) / 10;
        return [first, Math.round((share - first) * 10) / 10];
      };

      const counters = {};
      for (const spec of specs) {
        const mkId = mkByKode[spec.mk];
        if (!mkId) continue;
        counters[spec.mk] = (counters[spec.mk] || 0) + 1;
        const n = counters[spec.mk];
        const parentName = `[${spec.mk}] CPMK ${n}`;
        const parentId = ensureCpmk(mkId, parentName, null);
        if (spec.hasSub) {
          spec.scp.forEach((scpKey, index) => {
            const subId = ensureCpmk(mkId, `[${spec.mk}] Sub-CPMK ${n}.${index + 1}`, parentId);
            addMap(subId, [scpKey]);
            const [tugas, kuis] = splitShare(shareFor(spec.mk), 0.6);
            addSumber(subId, 'Tugas', tugas);
            addSumber(subId, 'Kuis', kuis);
          });
        } else {
          addMap(parentId, spec.scp);
          const [uts, uas] = splitShare(shareFor(spec.mk), 0.4);
          addSumber(parentId, 'UTS', uts);
          addSumber(parentId, 'UAS', uas);
        }
      }
    };
    applyCpmkSpecs(catalog.SI_CPMK);
    applyCpmkSpecs(catalog.MAT_CPMK);
    await chunkInsert(queryInterface, 'cpmk', cpmkRows);
    await chunkInsert(queryInterface, 'sumber_penilaian', sumberRows);
    await chunkInsert(queryInterface, 'cpmk_scp', mapRows);

    const dosenByNip = mapBy(await allRows(queryInterface, 'SELECT id, nip FROM dosen'), 'nip');
    const dosenInserts = [];
    for (const item of [...catalog.DOSEN_SI, ...catalog.DOSEN_MAT]) {
      if (dosenByNip[item.nip]) continue;
      const id = randomUUID();
      dosenByNip[item.nip] = id;
      dosenInserts.push(row(now, {
        id,
        nip: item.nip,
        nidn: item.nidn,
        nama: item.nama,
        program_studi_id: catalog.DOSEN_MAT.includes(item) ? prodiMat : prodiSi,
      }));
    }
    await chunkInsert(queryInterface, 'dosen', dosenInserts);
    const dosenSiIds = catalog.DOSEN_SI.map((item) => dosenByNip[item.nip]).filter(Boolean);
    const existingDosenSi = (await allRows(
      queryInterface,
      'SELECT id FROM dosen WHERE program_studi_id = :id',
      { id: prodiSi }
    )).map((item) => item.id);
    const allDosenSi = [...new Set([...existingDosenSi, ...dosenSiIds])];
    const dosenMatIds = catalog.DOSEN_MAT.map((item) => dosenByNip[item.nip]).filter(Boolean);

    const mhsByNiu = mapBy(await allRows(queryInterface, 'SELECT id, niu FROM mahasiswa'), 'niu');
    const mhsInserts = [
      ...buildStudents(40, 0, 2022, prodiSi, '57201', now),
      ...buildStudents(20, 40, 2023, prodiSi, '57201', now),
      ...buildStudents(15, 60, 2022, prodiMat, '44201', now),
    ].filter((item) => !mhsByNiu[item.niu]);
    mhsInserts.forEach((item) => {
      mhsByNiu[item.niu] = item.id;
    });
    await chunkInsert(queryInterface, 'mahasiswa', mhsInserts);

    const bimbinganExisting = new Set(
      (await allRows(queryInterface, 'SELECT dosen_id, mahasiswa_id, tahun_akademik FROM bimbingan_akademik'))
        .map((item) => `${item.dosen_id}:${item.mahasiswa_id}:${item.tahun_akademik}`)
    );
    const siMahasiswaIds = Object.entries(mhsByNiu)
      .filter(([niu]) => niu.startsWith('22572') || niu.startsWith('23572'))
      .map(([, id]) => id);
    const matMahasiswaIds = Object.entries(mhsByNiu)
      .filter(([niu]) => niu.startsWith('22442'))
      .map(([, id]) => id);
    const bimbinganRows = [];
    siMahasiswaIds.forEach((mahasiswaId, index) => {
      const dosenId = allDosenSi[index % allDosenSi.length];
      const key = `${dosenId}:${mahasiswaId}:2024/2025`;
      if (!dosenId || bimbinganExisting.has(key)) return;
      bimbinganExisting.add(key);
      bimbinganRows.push(row(now, {
        dosen_id: dosenId,
        mahasiswa_id: mahasiswaId,
        tahun_akademik: '2024/2025',
        status: 'aktif',
        catatan: 'Seed mapping demo',
      }));
    });
    matMahasiswaIds.forEach((mahasiswaId, index) => {
      const dosenId = dosenMatIds[index % dosenMatIds.length];
      const key = `${dosenId}:${mahasiswaId}:2024/2025`;
      if (!dosenId || bimbinganExisting.has(key)) return;
      bimbinganExisting.add(key);
      bimbinganRows.push(row(now, {
        dosen_id: dosenId,
        mahasiswa_id: mahasiswaId,
        tahun_akademik: '2024/2025',
        status: 'aktif',
        catatan: 'Seed mapping demo',
      }));
    });
    await chunkInsert(queryInterface, 'bimbingan_akademik', bimbinganRows);

    const ruangByKode = mapBy(await allRows(queryInterface, 'SELECT id, kode FROM ruang'), 'kode');
    const ruangInserts = catalog.RUANG.filter((item) => !ruangByKode[item.kode]).map((item) => {
      const id = randomUUID();
      ruangByKode[item.kode] = id;
      return row(now, { id, ...item });
    });
    await chunkInsert(queryInterface, 'ruang', ruangInserts);
    const ruangIds = Object.values(ruangByKode);

    const kelasExisting = await allRows(
      queryInterface,
      'SELECT id, semester_prodi_id, matakuliah_id, nama FROM kelas'
    );
    const kelasKey = (semProdiId, mkId, nama) => `${semProdiId}:${mkId}:${nama}`;
    const kelasByKey = Object.fromEntries(
      kelasExisting.map((item) => [kelasKey(item.semester_prodi_id, item.matakuliah_id, item.nama), item.id])
    );
    const kelasRows = [];
    const planKelas = [
      ...[...catalog.SI_MATAKULIAH, { kode: 'SI1101' }, { kode: 'SI2103' }]
        .filter((item) => {
          const full = catalog.SI_MATAKULIAH.find((rowItem) => rowItem.kode === item.kode);
          const semester = full?.semester ?? (item.kode === 'SI1101' ? 1 : 3);
          return oddSemester(semester);
        })
        .map((item) => ({ kode: item.kode, semProdi: semProdiSiGanjil, dosenPool: allDosenSi })),
      ...catalog.SI_MATAKULIAH.filter((item) => !oddSemester(item.semester))
        .map((item) => ({ kode: item.kode, semProdi: semProdiSiGenap, dosenPool: allDosenSi })),
      ...catalog.MAT_MATAKULIAH.map((item) => ({ kode: item.kode, semProdi: semProdiMatGanjil, dosenPool: dosenMatIds })),
    ];
    const kelasMeta = [];
    planKelas.forEach((plan, planIndex) => {
      const mkId = mkByKode[plan.kode];
      if (!mkId) return;
      ['A', 'B'].forEach((nama, sectionIndex) => {
        const key = kelasKey(plan.semProdi, mkId, nama);
        let id = kelasByKey[key];
        if (!id) {
          id = randomUUID();
          kelasByKey[key] = id;
          kelasRows.push(row(now, {
            id,
            semester_prodi_id: plan.semProdi,
            matakuliah_id: mkId,
            nama,
            jumlah_peserta_min: 10,
            jumlah_peserta_max: 40,
          }));
        }
        kelasMeta.push({
          id,
          mkId,
          semProdi: plan.semProdi,
          dosenPool: plan.dosenPool,
          slot: planIndex * 2 + sectionIndex,
        });
      });
    });
    await chunkInsert(queryInterface, 'kelas', kelasRows);

    const dosenKelasExisting = new Set(
      (await allRows(queryInterface, 'SELECT dosen_id, kelas_id FROM dosen_kelas'))
        .map((item) => `${item.dosen_id}:${item.kelas_id}`)
    );
    const jadwalExisting = new Set(
      (await allRows(queryInterface, 'SELECT kelas_id, hari, jam_mulai FROM jadwal_kelas'))
        .map((item) => `${item.kelas_id}:${item.hari}:${item.jam_mulai}`)
    );
    const dosenKelasRows = [];
    const jadwalRows = [];
    const dosenJadwalRows = [];
    for (const meta of kelasMeta) {
      const dosenId = meta.dosenPool[meta.slot % meta.dosenPool.length];
      if (dosenId && !dosenKelasExisting.has(`${dosenId}:${meta.id}`)) {
        const dosenKelasId = randomUUID();
        dosenKelasExisting.add(`${dosenId}:${meta.id}`);
        dosenKelasRows.push(row(now, {
          id: dosenKelasId,
          dosen_id: dosenId,
          kelas_id: meta.id,
          dosen_ke: 1,
        }));
        const hari = catalog.HARI[meta.slot % catalog.HARI.length];
        const [jamMulai, jamSelesai] = catalog.JAM[meta.slot % catalog.JAM.length];
        const jadwalKey = `${meta.id}:${hari}:${jamMulai}`;
        if (!jadwalExisting.has(jadwalKey)) {
          const jadwalId = randomUUID();
          jadwalExisting.add(jadwalKey);
          jadwalRows.push(row(now, {
            id: jadwalId,
            kelas_id: meta.id,
            ruang_id: ruangIds[meta.slot % ruangIds.length],
            hari,
            jam_mulai: jamMulai,
            jam_selesai: jamSelesai,
          }));
          dosenJadwalRows.push(row(now, { dosen_kelas_id: dosenKelasId, jadwal_kelas_id: jadwalId }));
        }
      }
    }
    await chunkInsert(queryInterface, 'dosen_kelas', dosenKelasRows);
    await chunkInsert(queryInterface, 'jadwal_kelas', jadwalRows);
    await chunkInsert(queryInterface, 'dosen_jadwal', dosenJadwalRows);

    const krsExisting = new Set(
      (await allRows(queryInterface, 'SELECT mahasiswa_id, semester_prodi_id FROM krs'))
        .map((item) => `${item.mahasiswa_id}:${item.semester_prodi_id}`)
    );
    const krsIdByKey = {};
    (await allRows(queryInterface, 'SELECT id, mahasiswa_id, semester_prodi_id FROM krs')).forEach((item) => {
      krsIdByKey[`${item.mahasiswa_id}:${item.semester_prodi_id}`] = item.id;
    });
    const krsRows = [];
    const enroll = (mahasiswaIds, semProdiId) => {
      for (const mahasiswaId of mahasiswaIds) {
        const key = `${mahasiswaId}:${semProdiId}`;
        if (krsExisting.has(key)) continue;
        const id = randomUUID();
        krsExisting.add(key);
        krsIdByKey[key] = id;
        krsRows.push(row(now, {
          id,
          mahasiswa_id: mahasiswaId,
          semester_prodi_id: semProdiId,
          approval_ke: 1,
        }));
      }
    };
    enroll(siMahasiswaIds, semProdiSiGanjil);
    enroll(siMahasiswaIds, semProdiSiGenap);
    enroll(matMahasiswaIds, semProdiMatGanjil);
    await chunkInsert(queryInterface, 'krs', krsRows);

    const krsDetilExisting = new Set(
      (await allRows(queryInterface, 'SELECT krs_id, kelas_id FROM krs_detil'))
        .map((item) => `${item.krs_id}:${item.kelas_id}`)
    );
    const krsDetilRows = [];
    const addDetil = (mahasiswaIds, semProdiId) => {
      const kelasIds = kelasMeta.filter((item) => item.semProdi === semProdiId).map((item) => item.id);
      mahasiswaIds.forEach((mahasiswaId, index) => {
        const krsId = krsIdByKey[`${mahasiswaId}:${semProdiId}`];
        if (!krsId) return;
        const picked = kelasIds.filter((_, kelasIndex) => kelasIndex % 2 === index % 2).slice(0, 6);
        for (const kelasId of picked) {
          const key = `${krsId}:${kelasId}`;
          if (krsDetilExisting.has(key)) continue;
          krsDetilExisting.add(key);
          krsDetilRows.push(row(now, { krs_id: krsId, kelas_id: kelasId, approved: '1' }));
        }
      });
    };
    addDetil(siMahasiswaIds, semProdiSiGanjil);
    addDetil(siMahasiswaIds, semProdiSiGenap);
    addDetil(matMahasiswaIds, semProdiMatGanjil);
    await chunkInsert(queryInterface, 'krs_detil', krsDetilRows);

    const sumberByCpmkMk = await allRows(
      queryInterface,
      `SELECT sp.id AS sumber_id, c.matakuliah_id
       FROM sumber_penilaian sp
       INNER JOIN cpmk c ON c.id = sp.cpmk_id
       WHERE c.parent_cpmk_id IS NOT NULL
          OR NOT EXISTS (
            SELECT 1 FROM cpmk child WHERE child.parent_cpmk_id = c.id AND child.deletedAt IS NULL
          )`
    );
    const sumberByMk = {};
    for (const item of sumberByCpmkMk) {
      if (!sumberByMk[item.matakuliah_id]) sumberByMk[item.matakuliah_id] = [];
      sumberByMk[item.matakuliah_id].push(item.sumber_id);
    }
    const detilWithMk = await allRows(
      queryInterface,
      `SELECT kd.id AS krs_detil_id, k.matakuliah_id
       FROM krs_detil kd
       INNER JOIN kelas k ON k.id = kd.kelas_id`
    );
    const nilaiExisting = new Set(
      (await allRows(queryInterface, 'SELECT krs_detil_id, sumber_penilaian_id FROM nilai_mahasiswa'))
        .map((item) => `${item.krs_detil_id}:${item.sumber_penilaian_id}`)
    );
    const nilaiRows = [];
    detilWithMk.forEach((item, index) => {
      const sumberIds = sumberByMk[item.matakuliah_id] || [];
      sumberIds.forEach((sumberId, sumberIndex) => {
        const key = `${item.krs_detil_id}:${sumberId}`;
        if (nilaiExisting.has(key)) return;
        nilaiExisting.add(key);
        nilaiRows.push(row(now, {
          krs_detil_id: item.krs_detil_id,
          sumber_penilaian_id: sumberId,
          nilai: 55 + ((index * 7 + sumberIndex * 13) % 41),
          catatan: null,
        }));
      });
    });
    await chunkInsert(queryInterface, 'nilai_mahasiswa', nilaiRows);
  },

  async down(queryInterface) {
    const niuLike = ['22572%', '23572%', '22442%'];
    const nips = [...catalog.DOSEN_SI, ...catalog.DOSEN_MAT].map((item) => item.nip);
    const mkKodes = [...catalog.SI_MATAKULIAH, ...catalog.MAT_MATAKULIAH].map((item) => item.kode);
    const cpNames = [...catalog.SI_CP, ...catalog.MAT_CP].map((item) => item.nama);
    const scpNames = [...catalog.SI_CP, ...catalog.MAT_CP].flatMap((item) => item.scp.map((scp) => scp.nama));
    const ruangKodes = catalog.RUANG.map((item) => item.kode);

    await queryInterface.sequelize.query(
      `DELETE nm FROM nilai_mahasiswa nm
       INNER JOIN krs_detil kd ON kd.id = nm.krs_detil_id
       INNER JOIN krs k ON k.id = kd.krs_id
       INNER JOIN mahasiswa m ON m.id = k.mahasiswa_id
       WHERE ${niuLike.map((pattern) => `m.niu LIKE '${pattern}'`).join(' OR ')}`
    );
    await queryInterface.sequelize.query(
      `DELETE kd FROM krs_detil kd
       INNER JOIN krs k ON k.id = kd.krs_id
       INNER JOIN mahasiswa m ON m.id = k.mahasiswa_id
       WHERE ${niuLike.map((pattern) => `m.niu LIKE '${pattern}'`).join(' OR ')}`
    );
    await queryInterface.sequelize.query(
      `DELETE k FROM krs k
       INNER JOIN mahasiswa m ON m.id = k.mahasiswa_id
       WHERE ${niuLike.map((pattern) => `m.niu LIKE '${pattern}'`).join(' OR ')}`
    );
    await queryInterface.sequelize.query(
      `DELETE dj FROM dosen_jadwal dj
       INNER JOIN jadwal_kelas jk ON jk.id = dj.jadwal_kelas_id
       INNER JOIN kelas k ON k.id = jk.kelas_id
       INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)`,
      { replacements: { kodes: [...mkKodes, 'SI1101', 'SI2103'] } }
    );
    await queryInterface.sequelize.query(
      `DELETE jk FROM jadwal_kelas jk
       INNER JOIN kelas k ON k.id = jk.kelas_id
       INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)`,
      { replacements: { kodes: [...mkKodes, 'SI1101', 'SI2103'] } }
    );
    await queryInterface.sequelize.query(
      `DELETE dk FROM dosen_kelas dk
       INNER JOIN kelas k ON k.id = dk.kelas_id
       INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)`,
      { replacements: { kodes: [...mkKodes, 'SI1101', 'SI2103'] } }
    );
    await queryInterface.sequelize.query(
      `DELETE k FROM kelas k
       INNER JOIN matakuliah mk ON mk.id = k.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)
          OR (mk.kode_matakuliah IN ('SI1101', 'SI2103') AND k.nama = 'B')`,
      { replacements: { kodes: mkKodes } }
    );
    await queryInterface.sequelize.query(
      `DELETE cs FROM cpmk_scp cs
       INNER JOIN cpmk c ON c.id = cs.cpmk_id
       WHERE c.nama_cpmk LIKE '[SI%' OR c.nama_cpmk LIKE '[MAT%'`
    );
    await queryInterface.sequelize.query(
      `DELETE sp FROM sumber_penilaian sp
       INNER JOIN cpmk c ON c.id = sp.cpmk_id
       WHERE c.nama_cpmk LIKE '[SI%' OR c.nama_cpmk LIKE '[MAT%'`
    );
    await queryInterface.sequelize.query(
      "DELETE FROM cpmk WHERE nama_cpmk LIKE '[SI%' OR nama_cpmk LIKE '[MAT%'"
    );
    if (scpNames.length) {
      await queryInterface.bulkDelete('scp', { nama_scp: scpNames });
    }
    if (cpNames.length) {
      await queryInterface.bulkDelete('cp', { nama_cp: cpNames });
    }
    await queryInterface.sequelize.query(
      `DELETE mkur FROM matakuliah_kurikulum mkur
       INNER JOIN matakuliah mk ON mk.id = mkur.matakuliah_id
       WHERE mk.kode_matakuliah IN (:kodes)`,
      { replacements: { kodes: mkKodes } }
    );
    await queryInterface.bulkDelete('matakuliah', { kode_matakuliah: mkKodes });
    await queryInterface.bulkDelete('ruang', { kode: ruangKodes });
    await queryInterface.sequelize.query(
      `DELETE FROM bimbingan_akademik WHERE mahasiswa_id IN (
         SELECT id FROM mahasiswa WHERE ${niuLike.map((pattern) => `niu LIKE '${pattern}'`).join(' OR ')}
       )`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM mahasiswa WHERE ${niuLike.map((pattern) => `niu LIKE '${pattern}'`).join(' OR ')}`
    );
    await queryInterface.bulkDelete('dosen', { nip: nips });
    await queryInterface.bulkDelete('kurikulum', { nama: 'Kurikulum OBE 2024 Matematika' });
  },
};

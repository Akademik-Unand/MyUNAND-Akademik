'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 1. Universitas
    const unandId = uuidv4();
    await queryInterface.bulkInsert('universitas', [{
      id: unandId,
      kode_universitas: 'U001',
      nama_resmi: 'Universitas Andalas',
      nama_singkat: 'Unand',
      createdAt: now,
      updatedAt: now,
    }]);

    // 2. Fakultas
    const fmipaId = uuidv4();
    await queryInterface.bulkInsert('fakultas', [{
      id: fmipaId,
      kode_fakultas: 'F001',
      universitas_id: unandId,
      nama_resmi: 'Fakultas Matematika dan Ilmu Pengetahuan Alam',
      nama_singkat: 'FMIPA',
      createdAt: now,
      updatedAt: now,
    }]);

    // 3. Departemen
    const deptMatId = uuidv4();
    const deptIlkomId = uuidv4();
    await queryInterface.bulkInsert('departemen', [
      {
        id: deptMatId,
        kode_departemen: 'D001',
        universitas_id: unandId,
        fakultas_id: fmipaId,
        nama_resmi: 'Departemen Matematika',
        nama_singkat: 'Matematika',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: deptIlkomId,
        kode_departemen: 'D002',
        universitas_id: unandId,
        fakultas_id: fmipaId,
        nama_resmi: 'Departemen Ilmu Komputer',
        nama_singkat: 'Ilkom',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 4. Jenjang Akademik
    const jenjangS1Id = uuidv4();
    const jenjangS2Id = uuidv4();
    await queryInterface.bulkInsert('jenjang_akademik', [
      { id: jenjangS1Id, kode_jenjang: 'S1', nama_jenjang: 'Sarjana', createdAt: now, updatedAt: now },
      { id: jenjangS2Id, kode_jenjang: 'S2', nama_jenjang: 'Magister', createdAt: now, updatedAt: now },
    ]);

    // 5. Model Kurikulum
    const modelAId = uuidv4();
    await queryInterface.bulkInsert('model_kurikulum', [
      { id: modelAId, nama_model: 'Model OBE Unand 2024', createdAt: now, updatedAt: now },
    ]);

    // 6. Program Studi
    const prodiSiId = uuidv4();
    const prodiMatId = uuidv4();
    await queryInterface.bulkInsert('program_studi', [
      {
        id: prodiSiId,
        kode_prodi: '57201',
        jenjang_akademik_id: jenjangS1Id,
        model_kurikulum_id: modelAId,
        universitas_id: unandId,
        fakultas_id: fmipaId,
        departemen_id: deptIlkomId,
        nama_resmi: 'Sistem Informasi',
        nama_singkat: 'SI',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: prodiMatId,
        kode_prodi: '44201',
        jenjang_akademik_id: jenjangS1Id,
        model_kurikulum_id: modelAId,
        universitas_id: unandId,
        fakultas_id: fmipaId,
        departemen_id: deptMatId,
        nama_resmi: 'Matematika',
        nama_singkat: 'MAT',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 7. Dosen
    const dosen1Id = uuidv4();
    const dosen2Id = uuidv4();
    await queryInterface.bulkInsert('dosen', [
      {
        id: dosen1Id,
        nip: '198001012005011001',
        program_studi_id: prodiSiId,
        nama: 'Dr. Eng. Ir. Dosen Satu, M.Kom',
        nidn: '0001018001',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: dosen2Id,
        nip: '198502022010012002',
        program_studi_id: prodiSiId,
        nama: 'Dosen Dua, S.Kom., M.T.',
        nidn: '0002028502',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 8. Mahasiswa
    const mhs1Id = uuidv4();
    const mhs2Id = uuidv4();
    await queryInterface.bulkInsert('mahasiswa', [
      {
        id: mhs1Id,
        niu: '2111521001',
        nama: 'Ahmad Fauzi',
        angkatan: 2021,
        program_studi_id: prodiSiId,
        jenis_kelamin: 'L',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: mhs2Id,
        niu: '2111522002',
        nama: 'Siti Rahma',
        angkatan: 2021,
        program_studi_id: prodiSiId,
        jenis_kelamin: 'P',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Update users to link dosen and mahasiswa
    await queryInterface.sequelize.query(
      `UPDATE users SET dosen_id = '${dosen1Id}' WHERE role = 'dosen' LIMIT 1;`
    );
    await queryInterface.sequelize.query(
      `UPDATE users SET mahasiswa_id = '${mhs1Id}' WHERE role = 'mahasiswa' LIMIT 1;`
    );

    // 9. Bimbingan Akademik
    await queryInterface.bulkInsert('bimbingan_akademik', [
      {
        id: uuidv4(),
        dosen_id: dosen1Id,
        mahasiswa_id: mhs1Id,
        tahun_akademik: '2024/2025',
        status: 'aktif',
        catatan: 'Pembimbingan Akademik Semester Ganjil',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        dosen_id: dosen1Id,
        mahasiswa_id: mhs2Id,
        tahun_akademik: '2024/2025',
        status: 'aktif',
        catatan: 'Pembimbingan Akademik Semester Ganjil',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 10. Jenis Semester
    const semGanjilId = uuidv4();
    const semGenapId = uuidv4();
    await queryInterface.bulkInsert('jenis_semester', [
      { id: semGanjilId, nama: 'Ganjil', alias: 'Ganjil', urut: 1, createdAt: now, updatedAt: now },
      { id: semGenapId, nama: 'Genap', alias: 'Genap', urut: 2, createdAt: now, updatedAt: now },
    ]);

    // 11. Semester
    const sem2024GanjilId = uuidv4();
    await queryInterface.bulkInsert('semester', [{
      id: sem2024GanjilId,
      jenis_semester_id: semGanjilId,
      tahun: 2024,
      tanggal_mulai: '2024-08-15',
      tanggal_selesai: '2024-12-30',
      createdAt: now,
      updatedAt: now,
    }]);

    // 12. Semester Prodi
    const semProdiId = uuidv4();
    await queryInterface.bulkInsert('semester_prodi', [{
      id: semProdiId,
      program_studi_id: prodiSiId,
      semester_id: sem2024GanjilId,
      is_aktif: true,
      tanggal_krs_mulai: '2024-08-01',
      tanggal_krs_selesai: '2024-08-20',
      tanggal_revisi_mulai: '2024-08-21',
      tanggal_revisi_selesai: '2024-08-27',
      sks_default: 18,
      sks_maksimal: 24,
      createdAt: now,
      updatedAt: now,
    }]);

    // 13. Kurikulum
    const kurikulumId = uuidv4();
    await queryInterface.bulkInsert('kurikulum', [{
      id: kurikulumId,
      program_studi_id: prodiSiId,
      tahun: 2024,
      nama: 'Kurikulum OBE 2024 SI',
      masa_studi_ideal: 8,
      masa_studi_maksimal: 14,
      createdAt: now,
      updatedAt: now,
    }]);

    // 14. Sifat & Tipe MK
    const sifatWajibId = uuidv4();
    const sifatPilihanId = uuidv4();
    await queryInterface.bulkInsert('sifat_matakuliah', [
      { id: sifatWajibId, kode_sifat_matakuliah: 'W', nama: 'Wajib', createdAt: now, updatedAt: now },
      { id: sifatPilihanId, kode_sifat_matakuliah: 'P', nama: 'Pilihan', createdAt: now, updatedAt: now },
    ]);

    const tipeTeoriId = uuidv4();
    const tipePrakId = uuidv4();
    await queryInterface.bulkInsert('tipe_matakuliah', [
      { id: tipeTeoriId, kode_tipe_matakuliah: 'T', nama: 'Teori', is_dipakai: 1, createdAt: now, updatedAt: now },
      { id: tipePrakId, kode_tipe_matakuliah: 'P', nama: 'Praktikum', is_dipakai: 1, createdAt: now, updatedAt: now },
    ]);

    // 15. Matakuliah
    const mkAlgoId = uuidv4();
    const mkBasisDataId = uuidv4();
    await queryInterface.bulkInsert('matakuliah', [
      {
        id: mkAlgoId,
        jenis_semester_id: semGanjilId,
        tipe_matakuliah_id: tipeTeoriId,
        sifat_matakuliah_id: sifatWajibId,
        kode_matakuliah: 'SI1101',
        nama_resmi: 'Algoritma dan Pemrograman',
        semester_kurikulum: 1,
        jumlah_sks_kurikulum: 3,
        jumlah_sks_teori: 2,
        jumlah_sks_praktikum: 1,
        bobot_nilai_minimal_lulus: 2.0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: mkBasisDataId,
        jenis_semester_id: semGanjilId,
        tipe_matakuliah_id: tipeTeoriId,
        sifat_matakuliah_id: sifatWajibId,
        kode_matakuliah: 'SI2103',
        nama_resmi: 'Sistem Basis Data',
        semester_kurikulum: 3,
        jumlah_sks_kurikulum: 3,
        jumlah_sks_teori: 2,
        jumlah_sks_praktikum: 1,
        bobot_nilai_minimal_lulus: 2.0,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 16. Matakuliah Kurikulum
    await queryInterface.bulkInsert('matakuliah_kurikulum', [
      { id: uuidv4(), kurikulum_id: kurikulumId, matakuliah_id: mkAlgoId, status: 'Wajib', createdAt: now, updatedAt: now },
      { id: uuidv4(), kurikulum_id: kurikulumId, matakuliah_id: mkBasisDataId, status: 'Wajib', createdAt: now, updatedAt: now },
    ]);

    // 17. CP & SCP
    const cp1Id = uuidv4();
    await queryInterface.bulkInsert('cp', [{
      id: cp1Id,
      kurikulum_id: kurikulumId,
      nama_cp: 'CPL-01: Kemampuan Algoritma & Rekayasa Perangkat Lunak',
      deskripsi: 'Mampu merancang dan mengimplementasikan algoritma perangkat lunak berstandar industri.',
      nilai_max: 100,
      nilai_min: 60,
      createdAt: now,
      updatedAt: now,
    }]);

    const scp1Id = uuidv4();
    await queryInterface.bulkInsert('scp', [{
      id: scp1Id,
      cp_id: cp1Id,
      nama_scp: 'Sub-CPL 1.1 Pemahaman Logika Pemrograman',
      deskripsi: 'Menguasai struktur data dasar dan algoritma penyelesaian masalah.',
      persen_capai_nilai_min: 65,
      nilai_min: 60,
      createdAt: now,
      updatedAt: now,
    }]);

    // 18. CPMK & Sumber Penilaian
    const cpmk1Id = uuidv4();
    await queryInterface.bulkInsert('cpmk', [{
      id: cpmk1Id,
      matakuliah_id: mkAlgoId,
      nama_cpmk: 'CPMK-1: Mahasiswa mampu menerapkan struktur percabangan dan perulangan',
      deskripsi: 'Evaluasi penerapan logika pemrograman terstruktur.',
      createdAt: now,
      updatedAt: now,
    }]);

    const sumberPenilaianUtsId = uuidv4();
    const sumberPenilaianUasId = uuidv4();
    await queryInterface.bulkInsert('sumber_penilaian', [
      { id: sumberPenilaianUtsId, cpmk_id: cpmk1Id, nama_sumber_penilaian: 'Ujian Tengah Semester (UTS)', bobot: 40, createdAt: now, updatedAt: now },
      { id: sumberPenilaianUasId, cpmk_id: cpmk1Id, nama_sumber_penilaian: 'Ujian Akhir Semester (UAS)', bobot: 60, createdAt: now, updatedAt: now },
    ]);

    // Mapping CPMK <-> SCP
    await queryInterface.bulkInsert('cpmk_scp', [{
      id: uuidv4(),
      scp_id: scp1Id,
      cpmk_id: cpmk1Id,
      createdAt: now,
      updatedAt: now,
    }]);

    // 19. Ruang
    const ruang1Id = uuidv4();
    await queryInterface.bulkInsert('ruang', [
      { id: ruang1Id, kode: 'R.H-101', nama: 'Ruang Kuliah Gedung H 101', kapasitas: 40, createdAt: now, updatedAt: now },
    ]);

    // 20. Kelas
    const kelasAlgoAId = uuidv4();
    await queryInterface.bulkInsert('kelas', [
      {
        id: kelasAlgoAId,
        semester_prodi_id: semProdiId,
        matakuliah_id: mkAlgoId,
        nama: 'A',
        jumlah_peserta_min: 10,
        jumlah_peserta_max: 40,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 21. Dosen Kelas & Jadwal
    const dosenKelasId = uuidv4();
    await queryInterface.bulkInsert('dosen_kelas', [
      { id: dosenKelasId, dosen_id: dosen1Id, kelas_id: kelasAlgoAId, dosen_ke: 1, createdAt: now, updatedAt: now },
    ]);

    const jadwalKelasId = uuidv4();
    await queryInterface.bulkInsert('jadwal_kelas', [
      {
        id: jadwalKelasId,
        kelas_id: kelasAlgoAId,
        ruang_id: ruang1Id,
        hari: 'Senin',
        jam_mulai: '08:00:00',
        jam_selesai: '10:30:00',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('dosen_jadwal', [
      { id: uuidv4(), dosen_kelas_id: dosenKelasId, jadwal_kelas_id: jadwalKelasId, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('dosen_jadwal', null, {});
    await queryInterface.bulkDelete('jadwal_kelas', null, {});
    await queryInterface.bulkDelete('dosen_kelas', null, {});
    await queryInterface.bulkDelete('kelas', null, {});
    await queryInterface.bulkDelete('ruang', null, {});
    await queryInterface.bulkDelete('cpmk_scp', null, {});
    await queryInterface.bulkDelete('sumber_penilaian', null, {});
    await queryInterface.bulkDelete('cpmk', null, {});
    await queryInterface.bulkDelete('scp', null, {});
    await queryInterface.bulkDelete('cp', null, {});
    await queryInterface.bulkDelete('matakuliah_kurikulum', null, {});
    await queryInterface.bulkDelete('matakuliah', null, {});
    await queryInterface.bulkDelete('tipe_matakuliah', null, {});
    await queryInterface.bulkDelete('sifat_matakuliah', null, {});
    await queryInterface.bulkDelete('kurikulum', null, {});
    await queryInterface.bulkDelete('semester_prodi', null, {});
    await queryInterface.bulkDelete('semester', null, {});
    await queryInterface.bulkDelete('jenis_semester', null, {});
    await queryInterface.bulkDelete('bimbingan_akademik', null, {});
    await queryInterface.bulkDelete('mahasiswa', null, {});
    await queryInterface.bulkDelete('dosen', null, {});
    await queryInterface.bulkDelete('program_studi', null, {});
    await queryInterface.bulkDelete('model_kurikulum', null, {});
    await queryInterface.bulkDelete('jenjang_akademik', null, {});
    await queryInterface.bulkDelete('departemen', null, {});
    await queryInterface.bulkDelete('fakultas', null, {});
    await queryInterface.bulkDelete('universitas', null, {});
  },
};

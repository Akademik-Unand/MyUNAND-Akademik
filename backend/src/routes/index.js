'use strict';
const express = require('express');
const router = express.Router();
const models = require('../models');
const createCrudController = require('../controllers/crudFactory');
const createCrudRouter = require('./crudRouterFactory');

// Custom routes
const authRoutes = require('./auth.routes');
const krsRoutes = require('./krs.routes');
const nilaiRoutes = require('./nilai.routes');

// Mount custom routes
router.use('/auth', authRoutes);
router.use('/krs', krsRoutes);
router.use('/nilai', nilaiRoutes);

// Helper for standard CRUD registration
const registerCrud = (path, Model, options = {}) => {
  const controller = createCrudController(Model, options);
  router.use(path, createCrudRouter(controller, { requireAuth: options.requireAuth !== false }));
};

// 1. Institusi & Master Data
registerCrud('/universitas', models.Universitas, {
  searchFields: ['kode_universitas', 'nama_resmi', 'nama_singkat'],
  defaultInclude: [{ model: models.Fakultas, as: 'fakultas' }],
});

registerCrud('/fakultas', models.Fakultas, {
  searchFields: ['kode_fakultas', 'nama_resmi', 'nama_singkat'],
  defaultInclude: [
    { model: models.Universitas, as: 'universitas' },
    { model: models.Departemen, as: 'departemen' },
  ],
});

registerCrud('/departemen', models.Departemen, {
  searchFields: ['kode_departemen', 'nama_resmi', 'nama_singkat'],
  sortableFields: ['kode_departemen', 'nama_resmi', 'nama_singkat', 'createdAt'],
  filterableFields: ['kode_departemen', 'fakultas_id', 'universitas_id'],
  defaultInclude: [
    { model: models.Universitas, as: 'universitas' },
    { model: models.Fakultas, as: 'fakultas' },
  ],
});

registerCrud('/jenjang-akademik', models.JenjangAkademik, {
  searchFields: ['kode_jenjang', 'nama_jenjang'],
  sortableFields: ['kode_jenjang', 'nama_jenjang', 'createdAt'],
  filterableFields: ['kode_jenjang'],
});

registerCrud('/model-kurikulum', models.ModelKurikulum, {
  searchFields: ['nama_model'],
});

registerCrud('/program-studi', models.ProgramStudi, {
  searchFields: ['kode_prodi', 'nama_resmi', 'nama_singkat'],
  sortableFields: ['kode_prodi', 'nama_resmi', 'nama_singkat', 'createdAt'],
  filterableFields: ['kode_prodi', 'jenjang_akademik_id', 'fakultas_id', 'departemen_id'],
  defaultInclude: [
    { model: models.JenjangAkademik, as: 'jenjangAkademik' },
    { model: models.ModelKurikulum, as: 'modelKurikulum' },
    { model: models.Fakultas, as: 'fakultas' },
    { model: models.Departemen, as: 'departemen' },
  ],
});

registerCrud('/dosen', models.Dosen, {
  searchFields: ['nip', 'nama', 'nidn'],
  defaultInclude: [{ model: models.ProgramStudi, as: 'programStudi' }],
});

registerCrud('/mahasiswa', models.Mahasiswa, {
  searchFields: ['niu', 'nama'],
  defaultInclude: [{ model: models.ProgramStudi, as: 'programStudi' }],
});

registerCrud('/bimbingan-akademik', models.BimbinganAkademik, {
  defaultInclude: [
    { model: models.Dosen, as: 'dosen' },
    { model: models.Mahasiswa, as: 'mahasiswa' },
  ],
});

// 2. Semester & Waktu
registerCrud('/jenis-semester', models.JenisSemester, {
  searchFields: ['nama', 'alias'],
  sortableFields: ['nama', 'alias', 'createdAt'],
  filterableFields: ['nama', 'alias'],
});

registerCrud('/semester', models.Semester, {
  sortableFields: ['createdAt'],
  filterableFields: ['jenis_semester_id'],
  defaultInclude: [{ model: models.JenisSemester, as: 'jenisSemester' }],
});

registerCrud('/semester-prodi', models.SemesterProdi, {
  defaultInclude: [
    { model: models.ProgramStudi, as: 'programStudi' },
    { model: models.Semester, as: 'semester', include: ['jenisSemester'] },
  ],
});

// 3. Kurikulum & Matakuliah
registerCrud('/kurikulum', models.Kurikulum, {
  searchFields: ['nama'],
  sortableFields: ['nama', 'tahun', 'masa_studi_ideal', 'masa_studi_maksimal', 'createdAt'],
  filterableFields: ['program_studi_id', 'tahun'],
  defaultInclude: [
    { model: models.ProgramStudi, as: 'programStudi' },
    { model: models.Cp, as: 'cp' },
  ],
});

registerCrud('/sifat-matakuliah', models.SifatMatakuliah, {
  searchFields: ['nama', 'kode_sifat_matakuliah'],
});

registerCrud('/tipe-matakuliah', models.TipeMatakuliah, {
  searchFields: ['nama', 'kode_tipe_matakuliah'],
});

registerCrud('/matakuliah', models.Matakuliah, {
  searchFields: ['kode_matakuliah', 'nama_resmi'],
  sortableFields: ['kode_matakuliah', 'nama_resmi', 'sks', 'createdAt'],
  filterableFields: ['kode_matakuliah', 'jenis_semester_id', 'tipe_matakuliah_id'],
  defaultInclude: [
    { model: models.JenisSemester, as: 'jenisSemester' },
    { model: models.TipeMatakuliah, as: 'tipeMatakuliah' },
    { model: models.SifatMatakuliah, as: 'sifatMatakuliah' },
    { model: models.Cpmk, as: 'cpmk' },
  ],
});

registerCrud('/matakuliah-kurikulum', models.MatakuliahKurikulum, {
  defaultInclude: [
    { model: models.Kurikulum, as: 'kurikulum' },
    { model: models.Matakuliah, as: 'matakuliah' },
  ],
});

// 4. OBE (CP, SCP, CPMK, Sumber Penilaian)
registerCrud('/cp', models.Cp, {
  searchFields: ['nama_cp', 'deskripsi'],
  defaultInclude: [
    { model: models.Kurikulum, as: 'kurikulum' },
    { model: models.Scp, as: 'scp' },
  ],
});

registerCrud('/scp', models.Scp, {
  searchFields: ['nama_scp', 'deskripsi'],
  defaultInclude: [{ model: models.Cp, as: 'cp' }],
});

registerCrud('/cpmk', models.Cpmk, {
  searchFields: ['nama_cpmk', 'deskripsi'],
  defaultInclude: [
    { model: models.Matakuliah, as: 'matakuliah' },
    { model: models.SumberPenilaian, as: 'sumberPenilaian' },
  ],
});

registerCrud('/sumber-penilaian', models.SumberPenilaian, {
  searchFields: ['nama_sumber_penilaian'],
  defaultInclude: [{ model: models.Cpmk, as: 'cpmk' }],
});

registerCrud('/cpmk-scp', models.CpmkScp, {
  defaultInclude: [
    { model: models.Scp, as: 'scp' },
    { model: models.Cpmk, as: 'cpmk' },
  ],
});

// 5. Perkuliahan & Penawaran Kelas
registerCrud('/ruang', models.Ruang, {
  searchFields: ['kode', 'nama'],
});

registerCrud('/kelas', models.Kelas, {
  searchFields: ['nama'],
  sortableFields: ['nama', 'createdAt'],
  filterableFields: ['matakuliah_id', 'semester_prodi_id'],
  defaultInclude: [
    { model: models.Matakuliah, as: 'matakuliah' },
    { model: models.SemesterProdi, as: 'semesterProdi' },
    { model: models.DosenKelas, as: 'dosenKelas', include: ['dosen'] },
    { model: models.JadwalKelas, as: 'jadwalKelas', include: ['ruang'] },
  ],
});

registerCrud('/dosen-kelas', models.DosenKelas, {
  defaultInclude: [
    { model: models.Dosen, as: 'dosen' },
    { model: models.Kelas, as: 'kelas' },
  ],
});

registerCrud('/jadwal-kelas', models.JadwalKelas, {
  defaultInclude: [
    { model: models.Kelas, as: 'kelas' },
    { model: models.Ruang, as: 'ruang' },
  ],
});

registerCrud('/dosen-jadwal', models.DosenJadwal, {
  defaultInclude: [
    { model: models.DosenKelas, as: 'dosenKelas' },
    { model: models.JadwalKelas, as: 'jadwalKelas' },
  ],
});

registerCrud('/krs-detil', models.KrsDetil, {
  defaultInclude: [
    { model: models.Kelas, as: 'kelas', include: ['matakuliah'] },
  ],
});

// 6. Evaluasi, History & Laporan
registerCrud('/history-upload-nilai', models.HistoryUploadNilai, {
  defaultInclude: [
    { model: models.Kelas, as: 'kelas', include: ['matakuliah'] },
    { model: models.User, as: 'user' },
  ],
});

registerCrud('/evaluasi-cpmk', models.EvaluasiCpmk, {
  defaultInclude: [
    { model: models.Kelas, as: 'kelas' },
    { model: models.Cpmk, as: 'cpmk' },
  ],
});

registerCrud('/rekap-cp', models.RekapCp, {
  sortableFields: ['createdAt'],
  filterableFields: ['mahasiswa_id', 'cp_id'],
  defaultInclude: [
    { model: models.Mahasiswa, as: 'mahasiswa' },
    { model: models.Cp, as: 'cp' },
  ],
});

registerCrud('/laporan-cp', models.LaporanCp, {
  sortableFields: ['createdAt'],
  filterableFields: ['program_studi_id', 'kurikulum_id'],
  defaultInclude: [
    { model: models.ProgramStudi, as: 'programStudi' },
    { model: models.Kurikulum, as: 'kurikulum' },
    { model: models.User, as: 'pembuat' },
  ],
});

// 7. Roles & Permissions & Users
registerCrud('/roles', models.Role, {
  searchFields: ['name'],
  defaultInclude: [{ model: models.Permission, as: 'permissions' }],
});

registerCrud('/permissions', models.Permission, {
  searchFields: ['name'],
});

registerCrud('/users', models.User, {
  searchFields: ['name', 'email'],
  defaultInclude: [
    { model: models.Dosen, as: 'dosen' },
    { model: models.Mahasiswa, as: 'mahasiswa' },
  ],
});

module.exports = router;

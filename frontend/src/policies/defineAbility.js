const SUBJECT_BY_KEY = {
  universitas: 'Universitas',
  fakultas: 'Fakultas',
  departemen: 'Departemen',
  'jenjang-akademik': 'JenjangAkademik',
  'model-kurikulum': 'ModelKurikulum',
  'program-studi': 'ProgramStudi',
  dosen: 'Dosen',
  mahasiswa: 'Mahasiswa',
  'bimbingan-akademik': 'BimbinganAkademik',
  'jenis-semester': 'JenisSemester',
  semester: 'Semester',
  'semester-prodi': 'SemesterProdi',
  kurikulum: 'Kurikulum',
  'sifat-matakuliah': 'SifatMatakuliah',
  'tipe-matakuliah': 'TipeMatakuliah',
  matakuliah: 'Matakuliah',
  'matakuliah-kurikulum': 'MatakuliahKurikulum',
  cp: 'Cp',
  scp: 'Scp',
  cpmk: 'Cpmk',
  'sumber-penilaian': 'SumberPenilaian',
  'cpmk-scp': 'CpmkScp',
  ruang: 'Ruang',
  kelas: 'Kelas',
  'dosen-kelas': 'DosenKelas',
  'jadwal-kelas': 'JadwalKelas',
  'dosen-jadwal': 'DosenJadwal',
  krs: 'Krs',
  'krs-detil': 'KrsDetil',
  nilai: 'NilaiMahasiswa',
  'history-upload-nilai': 'HistoryUploadNilai',
  'evaluasi-cpmk': 'EvaluasiCpmk',
  'rekap-cp': 'RekapCp',
  'laporan-cp': 'LaporanCp',
  role: 'Role',
  permission: 'Permission',
  user: 'User',
  'activity-log': 'ActivityLog',
};

export const parsePermission = (name) => {
  const [key, ...rest] = String(name).split('.');
  const action = rest.join('.');
  const subject = SUBJECT_BY_KEY[key];
  if (!subject || !action) return null;
  return { action, subject };
};

export const can = (user, action, subject) => {
  if (!user) return false;
  const roleNames = (user.roles || []).map((role) => role.name || role);
  if (user.role === 'superadmin' || roleNames.includes('superadmin')) return true;
  return (user.permissions || []).some((name) => {
    const parsed = parsePermission(name);
    return parsed?.action === action && parsed?.subject === subject;
  });
};

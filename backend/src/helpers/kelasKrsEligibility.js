'use strict';

const AppError = require('./AppError');

const hasCompleteSchedule = (kelas) =>
  (kelas?.jadwalKelas || []).some(
    (jadwal) => jadwal.hari && jadwal.jam_mulai && jadwal.jam_selesai
  );

const hasLecturer = (kelas) => (kelas?.dosenKelas || []).length > 0;

const assertKelasKrsReady = (kelas) => {
  const missingSchedule = !hasCompleteSchedule(kelas);
  const missingLecturer = !hasLecturer(kelas);

  if (missingSchedule && missingLecturer) {
    throw new AppError('Kelas belum memiliki jadwal lengkap dan dosen pengampu', 409);
  }
  if (missingSchedule) {
    throw new AppError('Kelas belum memiliki jadwal lengkap', 409);
  }
  if (missingLecturer) {
    throw new AppError('Kelas belum memiliki dosen pengampu', 409);
  }
};

module.exports = { hasCompleteSchedule, hasLecturer, assertKelasKrsReady };

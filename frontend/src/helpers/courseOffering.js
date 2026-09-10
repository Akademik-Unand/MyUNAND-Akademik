export const courseProgramId = (course) => course?.program_studi_id || course?.programStudi?.id || course?.kurikulum?.[0]?.program_studi_id || null;

export const coursesForProgram = (courses, programId) => programId ? (courses || []).filter((course) => String(courseProgramId(course)) === String(programId)) : [];

export const buildBulkOfferingPayload = (settings, courseIds, courseQuotas = {}) => ({
  semester_prodi_id: settings.semester_prodi_id,
  tanggal_mulai: settings.tanggal_mulai || null,
  tanggal_selesai: settings.tanggal_selesai || null,
  kuota_lintas_prodi_default: Number(settings.kuota_lintas_prodi || 0),
  akses: settings.akses,
  prodi_tujuan: settings.akses === 'terpilih' ? settings.prodi_tujuan : [],
  matakuliah: [...new Set(courseIds)].map((matakuliah_id) => ({
    matakuliah_id,
    kuota_lintas_prodi: courseQuotas[matakuliah_id] === '' || courseQuotas[matakuliah_id] == null
      ? Number(settings.kuota_lintas_prodi || 0)
      : Number(courseQuotas[matakuliah_id]),
  })),
});

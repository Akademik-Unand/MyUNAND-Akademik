export const courseProgramId = (course) =>
  course?.program_studi_id ||
  course?.programStudi?.id ||
  course?.kurikulum?.[0]?.program_studi_id ||
  null;

export const coursesForProgram = (courses, programId) =>
  programId
    ? (courses || []).filter(
        (course) => String(courseProgramId(course)) === String(programId),
      )
    : [];

export const buildBulkOfferingPayload = (
  settings,
  courseIds,
  courseQuotas = {},
  courses = [],
) => {
  const byId = new Map((courses || []).map((course) => [course.id, course]));
  return {
    semester_id: settings.semester_id,
    program_studi_id: settings.program_studi_id,
    kuota_lintas_prodi_default: Number(settings.kuota_lintas_prodi || 0),
    akses: settings.akses,
    prodi_tujuan: settings.akses === "terpilih" ? settings.prodi_tujuan : [],
    matakuliah: [...new Set(courseIds)].map((matakuliah_id) => {
      const course = byId.get(matakuliah_id);
      const kuota_lintas_prodi = course?.has_prasyarat
        ? 0
        : courseQuotas[matakuliah_id] === "" ||
            courseQuotas[matakuliah_id] == null
          ? Number(settings.kuota_lintas_prodi || 0)
          : Number(courseQuotas[matakuliah_id]);
      return { matakuliah_id, kuota_lintas_prodi };
    }),
  };
};

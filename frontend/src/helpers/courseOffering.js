import { deriveTotalCapacity } from "./kelasCapacity";

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

export const activeOfferingProgramId = (offerings, selectedId, ownProgramId) => {
  const availableIds = new Set((offerings || []).map((row) => row.program_studi_id));
  // Prodi sendiri tetap pilihan yang valid meski belum membuka penawaran.
  // Dengan begitu pilihan dropdown tidak meloncat kembali ke prodi lintas.
  if (selectedId && (availableIds.has(selectedId) || selectedId === ownProgramId))
    return selectedId;
  if (ownProgramId && availableIds.has(ownProgramId)) return ownProgramId;
  return (
    (offerings || []).find((row) => row.program_studi_id !== ownProgramId)
      ?.program_studi_id || ownProgramId || null
  );
};

export const buildBulkOfferingPayload = (
  settings,
  courseIds,
  courseQuotas = {},
  courses = [],
) => {
  const byId = new Map((courses || []).map((course) => [course.id, course]));
  const akses = settings.akses || "internal";
  return {
    semester_id: settings.semester_id,
    program_studi_id: settings.program_studi_id,
    akses,
    prodi_tujuan:
      akses === "terpilih"
        ? (settings.prodi_tujuan || []).map((program_studi_id) => ({ program_studi_id }))
        : [],
    matakuliah: [...new Set(courseIds)].map((matakuliah_id) => {
      const course = byId.get(matakuliah_id);
      const values = courseQuotas[matakuliah_id];
      const legacyExternal = typeof values === "string" || typeof values === "number";
      const internal = Number(
        values?.internal ??
          course?.jumlah_peserta_internal_max_default ??
          course?.jumlah_peserta_max_default ??
          40,
      );
      const kuota_lintas_prodi = akses === "internal" || course?.has_prasyarat
        ? 0
        : legacyExternal
          ? Number(values)
          : Number(values?.external ?? course?.kuota_lintas_prodi ?? 0);
      return {
        matakuliah_id,
        jumlah_peserta_max_default: deriveTotalCapacity(internal, kuota_lintas_prodi),
        jumlah_peserta_internal_max_default: internal,
        kuota_lintas_prodi,
      };
    }),
  };
};

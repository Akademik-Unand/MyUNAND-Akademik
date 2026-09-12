"use strict";
const { Op } = require("sequelize");
const {
  sequelize,
  PenawaranMatakuliah,
  PenawaranMatakuliahDetil,
  PenawaranMatakuliahProdi,
  Semester,
  ProgramStudi,
  Matakuliah,
  Cpmk,
  Scp,
  Cp,
  Kelas,
  JadwalKelas,
  Ruang,
  DosenKelas,
  Dosen,
  KrsDetil,
  Krs,
  Mahasiswa,
} = require("../../models");
const { paginate } = require("../../helpers/listQuery");
const AppError = require("../../helpers/AppError");
const { restoreRecord } = require("../../helpers/softDelete");
const { assertJadwalValid } = require("../../helpers/jadwalConflict");

const cpmkInclude = {
  model: Cpmk,
  as: "cpmk",
  where: { parent_cpmk_id: null },
  required: false,
  include: [
    {
      model: Scp,
      as: "scp",
      through: { attributes: [] },
      include: [{ model: Cp, as: "cp" }],
    },
    {
      model: Cpmk,
      as: "subCpmk",
      include: [
        {
          model: Scp,
          as: "scp",
          through: { attributes: [] },
          include: [{ model: Cp, as: "cp" }],
        },
      ],
    },
  ],
};
const kelasInclude = [
  {
    model: JadwalKelas,
    as: "jadwalKelas",
    include: [{ model: Ruang, as: "ruang" }],
  },
  {
    model: DosenKelas,
    as: "dosenKelas",
    include: [{ model: Dosen, as: "dosen" }],
  },
];
const detailInclude = [
  {
    model: Matakuliah,
    as: "matakuliah",
    include: [{ model: ProgramStudi, as: "programStudi" }, cpmkInclude],
  },
  { model: Kelas, as: "kelas", include: kelasInclude },
];
const detailIncludeWithParticipants = [
  { model: Semester, as: "semester" },
  { model: ProgramStudi, as: "programStudi" },
  {
    model: PenawaranMatakuliahDetil,
    as: "matakuliahDitawarkan",
    include: [
      {
        model: Matakuliah,
        as: "matakuliah",
        include: [{ model: ProgramStudi, as: "programStudi" }, cpmkInclude],
      },
      {
        model: Kelas,
        as: "kelas",
        include: [
          ...kelasInclude,
          {
            model: KrsDetil,
            as: "krsDetil",
            attributes: ["id"],
            include: [
              {
                model: Krs,
                as: "krs",
                attributes: ["id"],
                include: [
                  {
                    model: Mahasiswa,
                    as: "mahasiswa",
                    attributes: ["nama", "niu"],
                    include: [
                      {
                        model: ProgramStudi,
                        as: "programStudi",
                        attributes: ["nama_resmi", "nama_singkat"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
const include = [
  { model: Semester, as: "semester" },
  { model: ProgramStudi, as: "programStudi" },
  {
    model: PenawaranMatakuliahDetil,
    as: "matakuliahDitawarkan",
    include: detailInclude,
  },
  {
    model: PenawaranMatakuliahProdi,
    as: "prodiTujuan",
    include: [{ model: ProgramStudi, as: "programStudi" }],
  },
];
const options = {
  searchFields: [
    "$matakuliahDitawarkan.matakuliah.kode_matakuliah$",
    "$matakuliahDitawarkan.matakuliah.nama_resmi$",
  ],
  sortableFields: ["status", "tanggal_mulai", "tanggal_selesai", "createdAt"],
  filterableFields: ["semester_id", "program_studi_id", "status"],
  defaultInclude: include,
  findOptions: { subQuery: false, distinct: true },
};
const list = (query) => paginate(PenawaranMatakuliah, query, options);
const getById = async (id, transaction) => {
  const row = await PenawaranMatakuliah.findByPk(id, {
    include: detailIncludeWithParticipants,
    transaction,
  });
  if (!row) throw new AppError("Periode penawaran tidak ditemukan", 404);
  return row;
};
const validateCourses = async (programStudiId, courses, transaction) => {
  const rows = await Matakuliah.findAll({
    where: {
      id: courses.map((x) => x.matakuliah_id),
      program_studi_id: programStudiId,
    },
    attributes: ["id", "has_prasyarat"],
    transaction,
  });
  if (rows.length !== courses.length)
    throw new AppError(
      "Semua matakuliah harus dimiliki program studi penyelenggara",
      422,
    );
  const byId = new Map(rows.map((row) => [row.id, row]));
  for (const course of courses) {
    if (byId.get(course.matakuliah_id)?.has_prasyarat) {
      if ((course.kuota_lintas_prodi ?? 0) > 0)
        throw new AppError(
          "Mata kuliah berprasyarat tidak dapat dibuka untuk lintas prodi",
          422,
        );
      course.kuota_lintas_prodi = 0;
    }
  }
};
const syncCourses = async (header, courses, transaction) => {
  await validateCourses(header.program_studi_id, courses, transaction);
  const current = await PenawaranMatakuliahDetil.findAll({
    where: { penawaran_matakuliah_id: header.id },
    transaction,
  });
  const wanted = new Set(courses.map((x) => x.matakuliah_id));
  const removed = current.filter((x) => !wanted.has(x.matakuliah_id));
  if (
    removed.length &&
    (await Kelas.count({
      where: { penawaran_matakuliah_id: removed.map((x) => x.id) },
      transaction,
    }))
  )
    throw new AppError(
      "Matakuliah dengan kelas tidak dapat dikeluarkan dari penawaran",
      409,
    );
  if (removed.length)
    await PenawaranMatakuliahDetil.destroy({
      where: { id: removed.map((x) => x.id) },
      transaction,
    });
  for (const course of courses) {
    const [row] = await PenawaranMatakuliahDetil.findOrCreate({
      where: {
        penawaran_matakuliah_id: header.id,
        matakuliah_id: course.matakuliah_id,
      },
      defaults: course,
      transaction,
    });
    await row.update(course, { transaction });
  }
};
const save = (id, payload) =>
  sequelize.transaction(async (transaction) => {
    const { prodi_tujuan = [], matakuliah, ...data } = payload;
    let header;
    if (id) {
      header = await PenawaranMatakuliah.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!header) throw new AppError("Periode penawaran tidak ditemukan", 404);
      if (header.status !== "draft")
        throw new AppError("Hanya periode draft yang dapat diubah", 409);
      await header.update(data, { transaction });
    } else {
      const existing = await PenawaranMatakuliah.findOne({
        where: {
          semester_id: data.semester_id,
          program_studi_id: data.program_studi_id,
        },
        paranoid: false,
        transaction,
      });
      if (existing) {
        if (!existing.deletedAt)
          throw new AppError("Penawaran untuk semester dan program studi tersebut sudah dibuat", 409);
        await existing.restore({ transaction });
        header = await existing.update(data, { transaction });
      } else {
        header = await PenawaranMatakuliah.create(data, { transaction });
      }
    }
    if (matakuliah) await syncCourses(header, matakuliah, transaction);
    await PenawaranMatakuliahProdi.destroy({
      where: { penawaran_matakuliah_id: header.id },
      transaction,
    });
    if (prodi_tujuan.length)
      await PenawaranMatakuliahProdi.bulkCreate(
        prodi_tujuan.map((x) => ({ ...x, penawaran_matakuliah_id: header.id })),
        { transaction },
      );
    return getById(header.id, transaction);
  });
const bulkSync = (id, courses) =>
  sequelize.transaction(async (transaction) => {
    const header = await PenawaranMatakuliah.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!header) throw new AppError("Periode penawaran tidak ditemukan", 404);
    if (header.status !== "draft")
      throw new AppError("Hanya periode draft yang dapat disinkronkan", 409);
    await syncCourses(header, courses, transaction);
    return getById(id, transaction);
  });
const transition = (id, status) =>
  sequelize.transaction(async (transaction) => {
    const row = await PenawaranMatakuliah.findByPk(id, {
      include: [
        { model: PenawaranMatakuliahDetil, as: "matakuliahDitawarkan" },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!row) throw new AppError("Periode penawaran tidak ditemukan", 404);
    if (
      status === "published" &&
      (row.status !== "draft" || !row.matakuliahDitawarkan.length)
    )
      throw new AppError(
        "Draft harus memiliki matakuliah sebelum dipublikasikan",
        409,
      );
    if (status === "closed" && row.status !== "published")
      throw new AppError("Penawaran belum dipublikasikan", 409);
    await row.update(
      {
        status,
        published_at: status === "published" ? new Date() : row.published_at,
        closed_at: status === "closed" ? new Date() : null,
      },
      { transaction },
    );
    return getById(id, transaction);
  });
const catalog = async (query) => {
  const programStudiId = query.filter?.program_studi_id;
  const matakuliahId = query.filter?.matakuliah_id;
  const semesterId = query.filter?.semester_id;
  const detailWhere = matakuliahId
    ? { matakuliah_id: matakuliahId }
    : undefined;
  const where = { status: "published" };
  const and = [];
  if (programStudiId)
    and.push({
      [Op.or]: [
        { akses: "semua" },
        { "$prodiTujuan.program_studi_id$": programStudiId },
      ],
    });
  if (semesterId) and.push({ semester_id: semesterId });
  if (and.length) where[Op.and] = and;
  // `paginate` hanya membaca klausa where dari `findOptions.where`; where
  // top-level akan diabaikan sehingga draft ikut tampil. Selalu taruh di sini.
  return paginate(PenawaranMatakuliah, query, {
    ...options,
    filterableFields: [],
    findOptions: { ...options.findOptions, where },
    defaultInclude: include.map((item) =>
      item.as === "matakuliahDitawarkan"
        ? { ...item, where: detailWhere, required: Boolean(detailWhere) }
        : item,
    ),
  });
};
const remove = async (id) => {
  const row = await getById(id);
  if (row.status !== "draft")
    throw new AppError("Hanya draft yang dapat dihapus", 409);
  await row.destroy();
  return { id };
};
const createSchedule = (detailId, classId, payload) =>
  sequelize.transaction(async (transaction) => {
    const kelas = await Kelas.findOne({
      where: { id: classId, penawaran_matakuliah_id: detailId },
      transaction,
    });
    if (!kelas) throw new AppError("Kelas penawaran tidak ditemukan", 404);
    await assertJadwalValid({ ...payload, kelas_id: classId }, { transaction });
    return JadwalKelas.create(
      { ...payload, kelas_id: classId },
      { transaction },
    );
  });
const updateSchedule = (detailId, classId, id, payload) =>
  sequelize.transaction(async (transaction) => {
    const row = await JadwalKelas.findOne({
      where: { id, kelas_id: classId },
      include: [
        {
          model: Kelas,
          as: "kelas",
          where: { penawaran_matakuliah_id: detailId },
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!row) throw new AppError("Jadwal tidak ditemukan", 404);
    await assertJadwalValid({ ...row.toJSON(), ...payload }, { excludeId: id, transaction });
    return row.update(payload, { transaction });
  });
const deleteSchedule = async (detailId, classId, id) => {
  const row = await JadwalKelas.findOne({
    where: { id, kelas_id: classId },
    include: [
      {
        model: Kelas,
        as: "kelas",
        where: { penawaran_matakuliah_id: detailId },
      },
    ],
  });
  if (!row) throw new AppError("Jadwal tidak ditemukan", 404);
  await row.destroy();
  return { id };
};
module.exports = {
  list,
  getById,
  create: (p) => save(null, p),
  update: save,
  bulkSync,
  remove,
  restore: (id) =>
    restoreRecord(PenawaranMatakuliah, id, "Penawaran Matakuliah"),
  publish: (id) => transition(id, "published"),
  close: (id) => transition(id, "closed"),
  catalog,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};

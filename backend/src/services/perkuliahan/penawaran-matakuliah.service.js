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
const { paginate, normalizeListQuery } = require("../../helpers/listQuery");
const AppError = require("../../helpers/AppError");
const { restoreRecord } = require("../../helpers/softDelete");
const { assertJadwalValid } = require("../../helpers/jadwalConflict");
const { assertTeachingDay } = require("../../helpers/teachingDay");
const { assertKrsPeriodForSemester } = require("../../helpers/academicPeriod");
const { deriveTotalCapacity } = require("../../helpers/kelasCapacity");

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
    const internal = Number(course.jumlah_peserta_internal_max_default ?? course.jumlah_peserta_max_default ?? 40);
    let cross = Number(course.kuota_lintas_prodi ?? 0);
    if (byId.get(course.matakuliah_id)?.has_prasyarat) {
      if (cross > 0)
        throw new AppError(
          "Mata kuliah berprasyarat tidak dapat dibuka untuk lintas prodi",
          422,
        );
      course.kuota_lintas_prodi = 0;
      cross = 0;
    }
    course.jumlah_peserta_internal_max_default = internal;
    course.kuota_lintas_prodi = cross;
    course.jumlah_peserta_max_default = deriveTotalCapacity(internal, cross);
  }
};
const validateTargets = async (programStudiId, akses, targets, transaction) => {
  if (akses !== "terpilih") return;
  if (!targets.length)
    throw new AppError("Pilih setidaknya satu program studi tujuan lintas prodi", 422);
  if (targets.some((target) => target.program_studi_id === programStudiId))
    throw new AppError("Program studi penyelenggara tidak dapat menjadi target lintas prodi", 422);
  const rows = await ProgramStudi.findAll({
    where: { id: targets.map((target) => target.program_studi_id) },
    attributes: ["id"],
    transaction,
  });
  if (rows.length !== targets.length)
    throw new AppError("Satu atau lebih program studi tujuan tidak ditemukan", 422);
};
const syncCourses = async (header, courses, transaction, crossEnrollmentEnabled = true) => {
  if (!crossEnrollmentEnabled) {
    courses = courses.map((course) => ({ ...course, kuota_lintas_prodi: 0 }));
  }
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
    const { prodi_tujuan, matakuliah, ...data } = payload;
    let header;
    if (id) {
      header = await PenawaranMatakuliah.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!header) throw new AppError("Periode penawaran tidak ditemukan", 404);
      if (header.status !== "draft")
        throw new AppError("Hanya periode draft yang dapat diubah", 409);
    }
    const ownerId = data.program_studi_id || header?.program_studi_id;
    const akses = data.akses || header?.akses || "internal";
    data.akses = akses;
    const savedTargets = prodi_tujuan ?? (header && akses === "terpilih"
      ? await PenawaranMatakuliahProdi.findAll({
          where: { penawaran_matakuliah_id: header.id },
          attributes: ["program_studi_id"],
          transaction,
        })
      : []);
    await validateTargets(ownerId, akses, savedTargets, transaction);
    if (id) {
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
    if (matakuliah) await syncCourses(header, matakuliah, transaction, akses !== "internal");
    else if (akses === "internal")
      await PenawaranMatakuliahDetil.update(
        { kuota_lintas_prodi: 0 },
        { where: { penawaran_matakuliah_id: header.id }, transaction },
      );
    await PenawaranMatakuliahProdi.destroy({
      where: { penawaran_matakuliah_id: header.id },
      transaction,
    });
    const targetsToSave = akses === "terpilih" ? savedTargets : [];
    if (targetsToSave.length)
      await PenawaranMatakuliahProdi.bulkCreate(
        targetsToSave.map(({ program_studi_id }) => ({
          penawaran_matakuliah_id: header.id,
          program_studi_id,
        })),
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
        {
          model: PenawaranMatakuliahDetil,
          as: "matakuliahDitawarkan",
          include: [
            { model: Matakuliah, as: "matakuliah" },
            {
              model: Kelas,
              as: "kelas",
              include: [
                { model: JadwalKelas, as: "jadwalKelas" },
                { model: DosenKelas, as: "dosenKelas", attributes: ["id"] },
              ],
            },
          ],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!row) throw new AppError("Periode penawaran tidak ditemukan", 404);
    if (status === "published") {
      if (row.status !== "draft")
        throw new AppError("Hanya penawaran draft yang dapat dipublikasikan", 409);
      // Draft boleh disiapkan sebelum KRS dibuka; mahasiswa baru melihat
      // penawaran setelah publish, yang harus berada dalam periode KRS target.
      await assertKrsPeriodForSemester(row.semester_id);
      const issues = [];
      for (const detail of row.matakuliahDitawarkan || []) {
        const code = detail.matakuliah?.kode_matakuliah || detail.matakuliah?.nama_resmi || "Mata kuliah";
        const classes = detail.kelas || [];
        if (!classes.length) {
          issues.push(`${code}: kelas belum tersedia`);
          continue;
        }
        for (const kelas of classes) {
          const label = `${code} kelas ${kelas.nama}`;
          if (!(kelas.jadwalKelas || []).some((item) => item.hari && item.jam_mulai && item.jam_selesai))
            issues.push(`${label}: jadwal perkuliahan belum dibuat`);
          if (!(kelas.dosenKelas || []).length)
            issues.push(`${label}: dosen pengampu belum ditambahkan`);
        }
      }
      if (!row.matakuliahDitawarkan?.length) issues.push("Belum ada mata kuliah pada penawaran");
      if (issues.length)
        throw new AppError(`Penawaran belum dapat dipublikasikan: ${issues.join("; ")}`, 422);
    }
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
  const normalizedQuery = normalizeListQuery(query);
  const programStudiId = normalizedQuery.filter?.program_studi_id;
  const matakuliahId = normalizedQuery.filter?.matakuliah_id;
  const semesterId = normalizedQuery.filter?.semester_id;
  // Filter prodi/semester sudah diterapkan oleh `where` katalog di bawah.
  // Jangan teruskan ke `paginate`: filterableFields kosong berarti pakai semua
  // atribut model, sehingga program_studi_id akan membatasi hasil ke prodi host.
  const paginationQuery = { ...normalizedQuery };
  delete paginationQuery.filter;
  const detailWhere = matakuliahId
    ? { matakuliah_id: matakuliahId }
    : undefined;
  const where = { status: "published" };
  const and = [];
  if (programStudiId)
    and.push({
      [Op.or]: [
        { program_studi_id: programStudiId },
        { akses: "semua" },
        { "$prodiTujuan.program_studi_id$": programStudiId },
      ],
    });
  if (semesterId) and.push({ semester_id: semesterId });
  if (and.length) where[Op.and] = and;
  // `paginate` hanya membaca klausa where dari `findOptions.where`; where
  // top-level akan diabaikan sehingga draft ikut tampil. Selalu taruh di sini.
  return paginate(PenawaranMatakuliah, paginationQuery, {
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
const reopen = (id) =>
  sequelize.transaction(async (transaction) => {
    const row = await PenawaranMatakuliah.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!row) throw new AppError("Periode penawaran tidak ditemukan", 404);
    if (row.status !== "closed")
      throw new AppError("Hanya penawaran yang sudah ditutup yang dapat dibuka kembali untuk diedit", 409);
    const details = await PenawaranMatakuliahDetil.findAll({
      where: { penawaran_matakuliah_id: id },
      attributes: ["id"],
      transaction,
    });
    const classes = details.length
      ? await Kelas.findAll({
          where: { penawaran_matakuliah_id: details.map((item) => item.id) },
          attributes: ["id"],
          transaction,
        })
      : [];
    if (
      classes.length &&
      (await KrsDetil.count({
        where: { kelas_id: classes.map((item) => item.id) },
        transaction,
      }))
    )
      throw new AppError(
        "Penawaran tidak dapat dibuka untuk diedit karena kelasnya sudah digunakan pada KRS",
        409,
      );
    await row.update(
      { status: "draft", closed_at: null, published_at: null },
      { transaction },
    );
    return getById(id, transaction);
  });
const remove = async (id) => {
  const row = await getById(id);
  if (row.status !== "draft")
    throw new AppError("Hanya draft yang dapat dihapus", 409);
  await row.destroy();
  return { id };
};
const createSchedule = (detailId, classId, payload) =>
  sequelize.transaction(async (transaction) => {
    assertTeachingDay(payload.hari);
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
    assertTeachingDay(payload.hari, row.hari);
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
  reopen,
  catalog,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};

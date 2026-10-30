'use strict';

const { Op } = require('sequelize');

const { Matakuliah, ProgramStudi, JenisSemester, TipeMatakuliah, SifatMatakuliah, Cpmk, Kurikulum, MatakuliahKurikulum, DosenKelas, Kelas } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { getUserAcademicIdentity } = require('../../helpers/userAcademicProfile');
const { enforceDosenCourseScope } = require('../../helpers/dosenScope');

const LIST_OPTIONS = {
  searchFields: ["kode_matakuliah","nama_resmi"],
  sortableFields: ["kode_matakuliah","nama_resmi","createdAt"],
  filterableFields: ["kode_matakuliah","program_studi_id","jenis_semester_id","tipe_matakuliah_id"],
  defaultInclude: [
    { model: ProgramStudi, as: 'programStudi' },
    { model: JenisSemester, as: 'jenisSemester' },
    { model: TipeMatakuliah, as: 'tipeMatakuliah' },
    { model: SifatMatakuliah, as: 'sifatMatakuliah' },
    { model: Cpmk, as: 'cpmk' },
    { model: Kurikulum, as: 'kurikulum' },
  ],
};

const linkCourseToKurikulum = async (matakuliahId, prodiId, specifiedKurikulumId) => {
  try {
    let kurikulumId = specifiedKurikulumId;
    if (!kurikulumId && prodiId) {
      const kur = await Kurikulum.findOne({
        where: { program_studi_id: prodiId },
        order: [["tahun", "DESC"]],
      });
      kurikulumId = kur?.id;
    }
    if (kurikulumId) {
      await MatakuliahKurikulum.findOrCreate({
        where: { matakuliah_id: matakuliahId, kurikulum_id: kurikulumId },
        defaults: { status: "Wajib" },
      });
    }
  } catch {
    // Non-fatal fallback
  }
};

const ensureOrphanCoursesLinked = async () => {
  try {
    const orphans = await Matakuliah.findAll({
      include: [
        {
          model: MatakuliahKurikulum,
          as: "matakuliahKurikulum",
          required: false,
        },
      ],
      where: {
        "$matakuliahKurikulum.id$": null,
        program_studi_id: { [Op.ne]: null },
      },
    });
    for (const orphan of orphans) {
      await linkCourseToKurikulum(orphan.id, orphan.program_studi_id);
    }
  } catch {
    // Non-fatal fallback
  }
};

const list = async (query, userId, { manageAny = false } = {}) => {
  await ensureOrphanCoursesLinked();
  const { dosen_id: dosenId } = await getUserAcademicIdentity(userId);
  if (!dosenId || manageAny) return paginate(Matakuliah, query, LIST_OPTIONS);
  const assignments = await DosenKelas.findAll({
    where: { dosen_id: dosenId },
    attributes: [],
    include: [{ model: Kelas, as: 'kelas', attributes: ['matakuliah_id'], required: true }],
  });
  const ids = [...new Set(assignments.map((item) => item.kelas?.matakuliah_id).filter(Boolean))];
  return paginate(Matakuliah, query, { ...LIST_OPTIONS, findOptions: { where: { id: { [Op.in]: ids } } } });
};

const getById = async (id, userId, options = {}) => {
  const item = await Matakuliah.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Matakuliah dengan ID tersebut tidak ditemukan', 404);
  }
  await enforceDosenCourseScope(userId, item.id, options);
  return item;
};

const create = async (payload) => {
  const { kurikulum_id, ...data } = payload;
  const item = await Matakuliah.create(data);
  await linkCourseToKurikulum(item.id, item.program_studi_id, kurikulum_id);
  return Matakuliah.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const { kurikulum_id, ...data } = payload;
  const item = await getById(id);
  await item.update(data);
  await linkCourseToKurikulum(item.id, item.program_studi_id, kurikulum_id);
  return Matakuliah.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Matakuliah, id, 'Matakuliah');

module.exports = { list, getById, create, update, remove, restore };

'use strict';

const { Op } = require('sequelize');

const { Matakuliah, ProgramStudi, JenisSemester, TipeMatakuliah, SifatMatakuliah, Cpmk, Kurikulum, DosenKelas, Kelas } = require('../../models');
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

const list = async (query, userId, { manageAny = false } = {}) => {
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
  const item = await Matakuliah.create(payload);
  return Matakuliah.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Matakuliah.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Matakuliah, id, 'Matakuliah');

module.exports = { list, getById, create, update, remove, restore };

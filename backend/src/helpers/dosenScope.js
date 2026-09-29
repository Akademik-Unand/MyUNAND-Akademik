'use strict';

const { DosenKelas, Kelas } = require('../models');
const { getUserAcademicIdentity } = require('./userAcademicProfile');
const AppError = require('./AppError');

const assertTeachesClass = async (userId, kelasId, { manageAny = false, transaction } = {}) => {
  const { dosen_id: dosenId } = await getUserAcademicIdentity(userId, { transaction });
  if (!dosenId || manageAny) return;
  const assignment = await DosenKelas.findOne({ where: { dosen_id: dosenId, kelas_id: kelasId }, transaction });
  if (!assignment) throw new AppError('Anda tidak memiliki hak akses untuk kelas ini', 403);
};

const enforceDosenClassScope = async (userId, kelasId, { manageAny = false, transaction } = {}) => {
  const { dosen_id: dosenId } = await getUserAcademicIdentity(userId, { transaction });
  if (!dosenId || manageAny) return;
  if (!kelasId) throw new AppError('Pilih kelas yang Anda ampu untuk membatasi akses dosen', 403);
  await assertTeachesClass(userId, kelasId, { transaction });
};

const assertTeachesCourse = async (userId, matakuliahId, { manageAny = false, transaction } = {}) => {
  const { dosen_id: dosenId } = await getUserAcademicIdentity(userId, { transaction });
  if (!dosenId || manageAny) return;
  const assignment = await DosenKelas.findOne({
    where: { dosen_id: dosenId },
    include: [{ model: Kelas, as: 'kelas', attributes: [], required: true, where: { matakuliah_id: matakuliahId } }],
    transaction,
  });
  if (!assignment) throw new AppError('Anda tidak mengampu mata kuliah ini', 403);
};

const enforceDosenCourseScope = async (userId, matakuliahId, { manageAny = false, transaction } = {}) => {
  const { dosen_id: dosenId } = await getUserAcademicIdentity(userId, { transaction });
  if (!dosenId || manageAny) return;
  if (!matakuliahId) throw new AppError('Pilih mata kuliah untuk membatasi akses dosen', 403);
  await assertTeachesCourse(userId, matakuliahId, { transaction });
};

module.exports = { assertTeachesClass, enforceDosenClassScope, assertTeachesCourse, enforceDosenCourseScope };

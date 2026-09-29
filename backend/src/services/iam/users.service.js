'use strict';

const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { sequelize, User, Role, UserRole, Dosen, Mahasiswa, Fakultas, Departemen, ProgramStudi, UserUnit } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { ACCESS_INCLUDE, getUserAccessById, toAccessPayload } = require('../../helpers/userAccess');
const {
  assertUsableScope,
  assertUnitsInScope,
  assertRoleHierarchy,
  isUniversityActor,
} = require('../../helpers/organizationScopeGuard');
const { orgFiltersOnUserId } = require('../../helpers/academicFilters');
const { linkUserAcademicProfile } = require('../../helpers/userAcademicProfile');
const { programStudiWithOrganization } = require('../../helpers/academicProfileIncludes');

const UNIT_INCLUDE = [
  { model: Fakultas, as: 'fakultas' },
  { model: Departemen, as: 'departemen' },
  { model: ProgramStudi, as: 'programStudi' },
];

const LIST_OPTIONS = {
  searchFields: ['name', 'email'],
  sortableFields: ['name', 'email', 'role', 'createdAt'],
  filterableFields: ['email', 'role'],
  virtualFilters: orgFiltersOnUserId(sequelize),
  defaultInclude: () => [
    { model: Dosen, as: 'dosen', include: [programStudiWithOrganization()] },
    { model: Mahasiswa, as: 'mahasiswa', include: [programStudiWithOrganization()] },
    { model: Role, as: 'roles', through: { attributes: [] } },
  ],
  findOptions: { attributes: { exclude: ['password', 'remember_token'] } },
};

const unitDetail = (unit) => ({
  id: unit.id,
  fakultas_id: unit.fakultas_id || null,
  departemen_id: unit.departemen_id || null,
  program_studi_id: unit.program_studi_id || null,
  fakultas: unit.fakultas ? { id: unit.fakultas.id, kode: unit.fakultas.kode_fakultas || null, nama: unit.fakultas.nama_resmi || unit.fakultas.nama_singkat || null } : null,
  departemen: unit.departemen ? { id: unit.departemen.id, kode: unit.departemen.kode_departemen || null, nama: unit.departemen.nama_resmi || unit.departemen.nama_singkat || null, fakultas_id: unit.departemen.fakultas_id || null } : null,
  program_studi: unit.programStudi ? { id: unit.programStudi.id, kode: unit.programStudi.kode_prodi || null, nama: unit.programStudi.nama_resmi || null, nama_singkat: unit.programStudi.nama_singkat || null, fakultas_id: unit.programStudi.fakultas_id || null, departemen_id: unit.programStudi.departemen_id || null } : null,
});

const actorContext = (context = {}) => {
  assertUsableScope(context.access, context.orgScope);
  return context;
};

const scopedUserIds = async (scope, transaction) => {
  if (scope.level === 'universitas') return null;
  const clauses = [];
  if (scope.level === 'fakultas') clauses.push({ fakultas_id: { [Op.in]: scope.fakultas_ids } });
  if (scope.level === 'departemen') clauses.push({ departemen_id: { [Op.in]: scope.departemen_ids } });
  if (scope.level === 'prodi') clauses.push({ program_studi_id: { [Op.in]: scope.prodi_ids } });
  const rows = await UserUnit.findAll({ attributes: ['user_id'], where: { [Op.or]: clauses }, transaction });
  return [...new Set(rows.map((row) => row.user_id))];
};

const getScopedAccess = async (id, context, { paranoid = true } = {}) => {
  const { access, orgScope } = actorContext(context);
  const user = await User.findByPk(id, { include: ACCESS_INCLUDE, paranoid });
  if (!user) throw new AppError('User dengan ID tersebut tidak ditemukan', 404);
  if (!isUniversityActor(access, orgScope)) {
    const targetUnits = user.units || [];
    if (!targetUnits.length) throw new AppError('User target tidak memiliki scope organisasi yang dapat dikelola', 403);
    assertUnitsInScope(orgScope, targetUnits);
    assertRoleHierarchy(access, user.roles || []);
  }
  return user;
};

const list = async (query, context) => {
  const { orgScope } = actorContext(context);
  const ids = await scopedUserIds(orgScope);
  const scopedQuery = { ...query };
  const options = { ...LIST_OPTIONS, findOptions: { ...LIST_OPTIONS.findOptions } };
  if (ids) options.findOptions.where = { id: { [Op.in]: ids.length ? ids : [null] } };
  const { rows, pagination } = await paginate(User, scopedQuery, options);
  const rowIds = rows.map((row) => row.id);
  for (const row of rows) {
    row.setDataValue('dosen_id', row.dosen?.id || null);
    row.setDataValue('mahasiswa_id', row.mahasiswa?.id || null);
  }
  if (rowIds.length) {
    const units = await UserUnit.findAll({ where: { user_id: rowIds }, include: UNIT_INCLUDE });
    const byUser = new Map();
    for (const unit of units) byUser.set(unit.user_id, [...(byUser.get(unit.user_id) || []), unitDetail(unit)]);
    for (const row of rows) row.setDataValue('units', byUser.get(row.id) || []);
  }
  return { rows, pagination };
};

const getById = async (id, context) => {
  const user = await getScopedAccess(id, context);
  const payload = toAccessPayload(user);
  payload.units = (user.units || []).map(unitDetail);
  return payload;
};

const create = async (payload, context) => {
  actorContext(context);
  if (!isUniversityActor(context.access, context.orgScope)) {
    throw new AppError('User scoped harus dibuat lalu diberi role dan unit oleh admin universitas', 403);
  }
  const { role_ids: roleIds, ...userPayload } = payload;
  const dosenId = userPayload.dosen_id || null;
  const mahasiswaId = userPayload.mahasiswa_id || null;
  if (dosenId && mahasiswaId) {
    throw new AppError('Akun hanya dapat terhubung ke satu profil akademik', 422);
  }
  delete userPayload.dosen_id;
  delete userPayload.mahasiswa_id;
  const userId = await sequelize.transaction(async (transaction) => {
    if (await User.findOne({ where: { email: payload.email }, transaction })) {
      throw new AppError('Validation failed', 422, [{ field: 'email', message: 'Email sudah terdaftar' }]);
    }
    const uniqueIds = [...new Set(roleIds || [])];
    const roles = await Role.findAll({ where: { id: uniqueIds }, transaction });
    if (!uniqueIds.length || roles.length !== uniqueIds.length) {
      throw new AppError('Pilih setidaknya satu peran yang valid', 422);
    }
    assertRoleHierarchy(context.access, roles);
    const roleNames = new Set(roles.map((role) => role.name));
    if (roleNames.has('dosen') && !dosenId) {
      throw new AppError('Akun dengan peran dosen wajib ditautkan ke data dosen', 422);
    }
    if (roleNames.has('mahasiswa') && !mahasiswaId) {
      throw new AppError('Akun dengan peran mahasiswa wajib ditautkan ke data mahasiswa', 422);
    }
    const primaryRole = roles.slice().sort((a, b) => a.name.localeCompare(b.name))[0];
    const user = await User.create({
      ...userPayload,
      role: primaryRole.name,
      password: await bcrypt.hash(payload.password, 10),
    }, { transaction });
    await linkUserAcademicProfile({ userId: user.id, dosenId, mahasiswaId, transaction });
    await UserRole.bulkCreate(uniqueIds.map((roleId) => ({ user_id: user.id, role_id: roleId })), { transaction });
    return user.id;
  });
  return getById(userId, context);
};

const update = async (id, payload, context) => {
  const item = await getScopedAccess(id, context);
  const nextPayload = { ...payload };
  delete nextPayload.role;
  const hasAcademicLink = Object.prototype.hasOwnProperty.call(nextPayload, 'dosen_id') ||
    Object.prototype.hasOwnProperty.call(nextPayload, 'mahasiswa_id');
  const nextDosenId = Object.prototype.hasOwnProperty.call(nextPayload, 'dosen_id') ? nextPayload.dosen_id : item.dosen?.id || null;
  const nextMahasiswaId = Object.prototype.hasOwnProperty.call(nextPayload, 'mahasiswa_id') ? nextPayload.mahasiswa_id : item.mahasiswa?.id || null;
  if (nextDosenId && nextMahasiswaId) {
    throw new AppError('Akun hanya dapat terhubung ke satu profil akademik', 422);
  }
  delete nextPayload.dosen_id;
  delete nextPayload.mahasiswa_id;
  if (nextPayload.password) nextPayload.password = await bcrypt.hash(nextPayload.password, 10);
  else delete nextPayload.password;
  await sequelize.transaction(async (transaction) => {
    await item.update(nextPayload, { transaction });
    if (hasAcademicLink) {
      await linkUserAcademicProfile({ userId: item.id, dosenId: nextDosenId, mahasiswaId: nextMahasiswaId, transaction });
    }
  });
  return getById(id, context);
};

const remove = async (id, context) => {
  const item = await getScopedAccess(id, context);
  if (item.id === context.access.id) throw new AppError('User tidak dapat menghapus dirinya sendiri', 422);
  await item.destroy();
  return { id };
};

const restore = async (id, context) => {
  const item = await getScopedAccess(id, context, { paranoid: false });
  if (!item.deletedAt) throw new AppError('User tidak dalam keadaan terhapus', 422);
  await item.restore();
  return getById(id, context);
};

const assignRoles = async (id, roleIds, context) => {
  actorContext(context);
  if (id === context.access.id) throw new AppError('User tidak dapat mengubah role dirinya sendiri', 422);
  const uniqueIds = [...new Set(roleIds)];
  return sequelize.transaction(async (transaction) => {
    const user = await getScopedAccess(id, context);
    const roles = await Role.findAll({ where: { id: uniqueIds }, transaction });
    if (roles.length !== uniqueIds.length) throw new AppError('Sebagian role tidak ditemukan', 422);
    assertRoleHierarchy(context.access, roles);
    await UserRole.destroy({ where: { user_id: id }, transaction });
    if (uniqueIds.length) await UserRole.bulkCreate(uniqueIds.map((roleId) => ({ user_id: id, role_id: roleId })), { transaction });
    await user.update({ role: roles.slice().sort((a, b) => a.name.localeCompare(b.name))[0]?.name || null }, { transaction });
    return getById(id, context);
  });
};

const normalizeUnits = async (units, transaction) => {
  const unique = [];
  const seen = new Set();
  for (const unit of units) {
    const ids = [unit.fakultas_id, unit.departemen_id, unit.program_studi_id].filter(Boolean);
    if (ids.length !== 1) throw new AppError('Setiap unit harus menargetkan tepat satu level organisasi', 422);
    if (!seen.has(ids[0])) { seen.add(ids[0]); unique.push(unit); }
  }
  const normalized = [];
  for (const unit of unique) {
    if (unit.fakultas_id) {
      const fakultas = await Fakultas.findByPk(unit.fakultas_id, { transaction });
      if (!fakultas) throw new AppError('Fakultas tidak ditemukan', 422);
      normalized.push({ fakultas_id: fakultas.id, departemen_id: null, program_studi_id: null });
    } else if (unit.departemen_id) {
      const departemen = await Departemen.findByPk(unit.departemen_id, { transaction });
      if (!departemen) throw new AppError('Departemen tidak ditemukan', 422);
      normalized.push({ fakultas_id: null, departemen_id: departemen.id, program_studi_id: null, departemen: { fakultas_id: departemen.fakultas_id } });
    } else {
      const prodi = await ProgramStudi.findByPk(unit.program_studi_id, { transaction });
      if (!prodi) throw new AppError('Program studi tidak ditemukan', 422);
      normalized.push({ fakultas_id: null, departemen_id: null, program_studi_id: prodi.id, programStudi: { fakultas_id: prodi.fakultas_id, departemen_id: prodi.departemen_id } });
    }
  }
  return normalized;
};

const assignUnits = async (id, units, context) => {
  actorContext(context);
  if (id === context.access.id) throw new AppError('User tidak dapat mengubah unit dirinya sendiri', 422);
  return sequelize.transaction(async (transaction) => {
    await getScopedAccess(id, context);
    const normalized = await normalizeUnits(units, transaction);
    assertUnitsInScope(context.orgScope, normalized);
    await UserUnit.destroy({ where: { user_id: id }, transaction });
    if (normalized.length) await UserUnit.bulkCreate(normalized.map((unit) => ({ user_id: id, fakultas_id: unit.fakultas_id, departemen_id: unit.departemen_id, program_studi_id: unit.program_studi_id })), { transaction });
    return getById(id, context);
  });
};

module.exports = { list, getById, create, update, remove, restore, assignRoles, assignUnits, ACCESS_INCLUDE };

'use strict';

const bcrypt = require('bcryptjs');
const { sequelize, User, Role, UserRole, Dosen, Mahasiswa, Fakultas, Departemen, ProgramStudi, UserUnit } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');
const { ACCESS_INCLUDE, getUserAccessById, toAccessPayload } = require('../../helpers/userAccess');

const LIST_OPTIONS = {
  searchFields: ['name', 'email'],
  sortableFields: ['name', 'email', 'role', 'createdAt'],
  filterableFields: ['email', 'role'],
  defaultInclude: [
    { model: Dosen, as: 'dosen' },
    { model: Mahasiswa, as: 'mahasiswa' },
    { model: Role, as: 'roles', through: { attributes: [] } },
  ],
  findOptions: {
    attributes: { exclude: ['password', 'remember_token'] },
  },
};

const list = async (query) => {
  const { rows, pagination } = await paginate(User, query, LIST_OPTIONS);
  // Lampirkan unit (dengan nama) per halaman lewat satu query tambahan, supaya
  // kolom unit di tabel terisi tanpa mengubah query utama (pagination tetap akurat).
  const ids = rows.map((row) => row.id);
  if (ids.length) {
    const units = await UserUnit.findAll({ where: { user_id: ids }, include: UNIT_INCLUDE });
    const byUser = new Map();
    for (const unit of units) {
      const list = byUser.get(unit.user_id) || [];
      list.push(unitDetail(unit));
      byUser.set(unit.user_id, list);
    }
    for (const row of rows) {
      row.setDataValue('units', byUser.get(row.id) || []);
    }
  }
  return { rows, pagination };
};

const UNIT_INCLUDE = [
  { model: Fakultas, as: 'fakultas' },
  { model: Departemen, as: 'departemen' },
  { model: ProgramStudi, as: 'programStudi' },
];

const unitDetail = (unit) => ({
  id: unit.id,
  fakultas_id: unit.fakultas_id || null,
  departemen_id: unit.departemen_id || null,
  program_studi_id: unit.program_studi_id || null,
  fakultas: unit.fakultas
    ? { id: unit.fakultas.id, nama: unit.fakultas.nama_resmi || unit.fakultas.nama_singkat || null }
    : null,
  departemen: unit.departemen
    ? { id: unit.departemen.id, nama: unit.departemen.nama_resmi || unit.departemen.nama_singkat || null }
    : null,
  programStudi: unit.programStudi
    ? {
        id: unit.programStudi.id,
        nama: unit.programStudi.nama_resmi || null,
        kode: unit.programStudi.kode_prodi || null,
      }
    : null,
});

const getById = async (id) => {
  const user = await getUserAccessById(id, { required: true, notFoundCode: 404 });
  const payload = toAccessPayload(user);
  payload.units = (user.units || []).map(unitDetail);
  return payload;
};

const syncPrimaryRole = async (user, roles, transaction) => {
  const primary = roles[0];
  if (primary?.name) {
    await user.update({ role: primary.name }, { transaction });
  }
};

const create = async (payload) => {
  const existing = await User.findOne({ where: { email: payload.email } });
  if (existing) {
    throw new AppError('Validation failed', 422, [{ field: 'email', message: 'Email sudah terdaftar' }]);
  }

  const user = await User.create({
    ...payload,
    password: await bcrypt.hash(payload.password, 10),
  });
  return getById(user.id);
};

const update = async (id, payload) => {
  const item = await User.findByPk(id);
  if (!item) {
    throw new AppError('User dengan ID tersebut tidak ditemukan', 404);
  }

  const nextPayload = { ...payload };
  if (nextPayload.password) {
    nextPayload.password = await bcrypt.hash(nextPayload.password, 10);
  } else {
    delete nextPayload.password;
  }

  await item.update(nextPayload);
  return getById(id);
};

const remove = async (id) => {
  const item = await User.findByPk(id);
  if (!item) {
    throw new AppError('User dengan ID tersebut tidak ditemukan', 404);
  }
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(User, id, 'User');

const assignRoles = async (id, roleIds) => {
  const uniqueIds = [...new Set(roleIds)];
  return sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      throw new AppError('User dengan ID tersebut tidak ditemukan', 404);
    }

    const roles = await Role.findAll({ where: { id: uniqueIds }, transaction });
    if (roles.length !== uniqueIds.length) {
      throw new AppError('Sebagian role tidak ditemukan', 422);
    }

    await UserRole.destroy({ where: { user_id: id }, transaction });
    if (uniqueIds.length) {
      await UserRole.bulkCreate(
        uniqueIds.map((roleId) => ({ user_id: id, role_id: roleId })),
        { transaction }
      );
    }
    await syncPrimaryRole(user, roles, transaction);
    return getById(id);
  });
};

const assertUnitExists = async (Model, label, ids, transaction) => {
  if (!ids.length) return;
  const found = await Model.findAll({ where: { id: ids }, transaction });
  if (found.length !== ids.length) {
    throw new AppError(`Sebagian ${label} tidak ditemukan`, 422);
  }
};

const assignUnits = async (id, units) => {
  const seen = new Set();
  const unique = [];
  for (const unit of units) {
    const key = `${unit.fakultas_id || ''}:${unit.departemen_id || ''}:${unit.program_studi_id || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(unit);
  }

  return sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(id, { transaction });
    if (!user) {
      throw new AppError('User dengan ID tersebut tidak ditemukan', 404);
    }

    await assertUnitExists(Fakultas, 'fakultas', [...new Set(unique.map((u) => u.fakultas_id).filter(Boolean))], transaction);
    await assertUnitExists(Departemen, 'departemen', [...new Set(unique.map((u) => u.departemen_id).filter(Boolean))], transaction);
    await assertUnitExists(ProgramStudi, 'program studi', [...new Set(unique.map((u) => u.program_studi_id).filter(Boolean))], transaction);

    await UserUnit.destroy({ where: { user_id: id }, transaction });
    if (unique.length) {
      await UserUnit.bulkCreate(
        unique.map((unit) => ({
          user_id: id,
          fakultas_id: unit.fakultas_id || null,
          departemen_id: unit.departemen_id || null,
          program_studi_id: unit.program_studi_id || null,
        })),
        { transaction }
      );
    }
    return getById(id);
  });
};

module.exports = { list, getById, create, update, remove, restore, assignRoles, assignUnits, ACCESS_INCLUDE };

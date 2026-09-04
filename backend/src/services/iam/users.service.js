'use strict';

const bcrypt = require('bcryptjs');
const { sequelize, User, Role, UserRole, Dosen, Mahasiswa } = require('../../models');
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

const list = (query) => paginate(User, query, LIST_OPTIONS);

const getById = async (id) => toAccessPayload(await getUserAccessById(id, { required: true, notFoundCode: 404 }));

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

module.exports = { list, getById, create, update, remove, restore, assignRoles, ACCESS_INCLUDE };

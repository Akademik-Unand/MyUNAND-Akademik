'use strict';

const { User, Role, Permission, Dosen, Mahasiswa } = require('../models');
const AppError = require('./AppError');

const ACCESS_INCLUDE = [
  { model: Dosen, as: 'dosen' },
  { model: Mahasiswa, as: 'mahasiswa' },
  {
    model: Role,
    as: 'roles',
    through: { attributes: [] },
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
  },
];

const collectPermissions = (user) => {
  const names = new Set();
  for (const role of user.roles || []) {
    for (const permission of role.permissions || []) {
      names.add(permission.name);
    }
  }
  return [...names];
};

const toAccessPayload = (user) => {
  const roles = (user.roles || []).map((role) => ({ id: role.id, name: role.name }));
  const permissions = collectPermissions(user);
  const primary = roles[0]?.name || user.role;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: primary,
    roles,
    permissions,
    dosen_id: user.dosen_id,
    mahasiswa_id: user.mahasiswa_id,
    dosen: user.dosen,
    mahasiswa: user.mahasiswa,
  };
};

const findUserWithAccess = async (where) => {
  const user = await User.findOne({
    where,
    include: ACCESS_INCLUDE,
  });
  return user;
};

const getUserAccessById = async (id, { required = true, notFoundCode = 401 } = {}) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['password', 'remember_token'] },
    include: ACCESS_INCLUDE,
  });
  if (!user && required) {
    throw new AppError('User tidak ditemukan', notFoundCode);
  }
  return user;
};

module.exports = {
  ACCESS_INCLUDE,
  collectPermissions,
  toAccessPayload,
  findUserWithAccess,
  getUserAccessById,
};

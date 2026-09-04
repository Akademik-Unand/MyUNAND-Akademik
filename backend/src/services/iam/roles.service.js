'use strict';

const { sequelize, Role, Permission, RolePermission } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');
const { restoreRecord } = require('../../helpers/softDelete');

const LIST_OPTIONS = {
  searchFields: ['name'],
  sortableFields: ['name', 'createdAt'],
  filterableFields: ['name', 'guard_name'],
  defaultInclude: [
    { model: Permission, as: 'permissions', through: { attributes: [] } },
  ],
};

const list = (query) => paginate(Role, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await Role.findByPk(id, { include: LIST_OPTIONS.defaultInclude });
  if (!item) {
    throw new AppError('Role dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

const create = async (payload) => {
  const item = await Role.create(payload);
  return Role.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const update = async (id, payload) => {
  const item = await getById(id);
  await item.update(payload);
  return Role.findByPk(item.id, { include: LIST_OPTIONS.defaultInclude });
};

const remove = async (id) => {
  const item = await getById(id);
  await item.destroy();
  return { id };
};

const restore = (id) => restoreRecord(Role, id, 'Role');

const getMatrix = async () => {
  const roles = await Role.findAll({ order: [['name', 'ASC']] });
  const permissions = await Permission.findAll({
    order: [['group', 'ASC'], ['subject', 'ASC'], ['action', 'ASC']],
  });
  const grants = await RolePermission.findAll();
  const grantMap = {};
  for (const row of grants) {
    if (!grantMap[row.role_id]) grantMap[row.role_id] = [];
    grantMap[row.role_id].push(row.permission_id);
  }

  const grouped = {};
  for (const permission of permissions) {
    const group = permission.group || 'lainnya';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(permission);
  }

  return {
    roles,
    permissions,
    grouped,
    grants: grantMap,
  };
};

const syncPermissions = async (id, permissionIds) => {
  const uniqueIds = [...new Set(permissionIds)];
  return sequelize.transaction(async (transaction) => {
    const role = await Role.findByPk(id, { transaction });
    if (!role) {
      throw new AppError('Role dengan ID tersebut tidak ditemukan', 404);
    }
    const permissions = await Permission.findAll({ where: { id: uniqueIds }, transaction });
    if (permissions.length !== uniqueIds.length) {
      throw new AppError('Sebagian permission tidak ditemukan', 422);
    }
    await RolePermission.destroy({ where: { role_id: id }, transaction });
    if (uniqueIds.length) {
      await RolePermission.bulkCreate(
        uniqueIds.map((permissionId) => ({ role_id: id, permission_id: permissionId })),
        { transaction }
      );
    }
    return getById(id);
  });
};

module.exports = { list, getById, create, update, remove, restore, getMatrix, syncPermissions };

'use strict';

const { User, Role, Permission, Dosen, Mahasiswa, UserUnit, Fakultas, Departemen, ProgramStudi } = require('../models');
const AppError = require('./AppError');
const { computeOrgScope } = require('./orgScope');
const { roleLabel } = require('../constants/roles');

const ACCESS_INCLUDE = [
  { model: Dosen, as: 'dosen' },
  { model: Mahasiswa, as: 'mahasiswa' },
  {
    model: Role,
    as: 'roles',
    through: { attributes: [] },
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
  },
  {
    model: UserUnit,
    as: 'units',
    include: [
      { model: Fakultas, as: 'fakultas' },
      { model: Departemen, as: 'departemen' },
      { model: ProgramStudi, as: 'programStudi' },
    ],
  },
];

const collectPermissions = (user) => {
  const names = new Set();
  for (const role of user.roles || []) for (const permission of role.permissions || []) if (permission?.name) names.add(permission.name);
  return [...names].sort((a, b) => a.localeCompare(b));
};

const toAccessPayload = (user) => {
  const roles = (user.roles || [])
    .map((role) => ({ id: role.id, name: role.name, label: roleLabel(role.name) }))
    .sort((a, b) => a.name.localeCompare(b.name) || String(a.id).localeCompare(String(b.id)));
  const primary = roles[0]?.name || null;
  const units = (user.units || []).map((unit) => ({
    id: unit.id,
    fakultas_id: unit.fakultas_id || null,
    departemen_id: unit.departemen_id || null,
    program_studi_id: unit.program_studi_id || null,
    fakultas: unit.fakultas ? { id: unit.fakultas.id, kode: unit.fakultas.kode_fakultas || null, nama: unit.fakultas.nama_resmi || unit.fakultas.nama_singkat || null } : null,
    departemen: unit.departemen ? { id: unit.departemen.id, kode: unit.departemen.kode_departemen || null, nama: unit.departemen.nama_resmi || unit.departemen.nama_singkat || null, fakultas_id: unit.departemen.fakultas_id || null } : null,
    program_studi: unit.programStudi ? { id: unit.programStudi.id, kode: unit.programStudi.kode_prodi || null, nama: unit.programStudi.nama_resmi || unit.programStudi.nama_singkat || null, fakultas_id: unit.programStudi.fakultas_id || null, departemen_id: unit.programStudi.departemen_id || null } : null,
  })).sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: primary,
    role_label: primary ? roleLabel(primary) : null,
    roles,
    permissions: collectPermissions(user),
    dosen_id: user.dosen_id,
    mahasiswa_id: user.mahasiswa_id,
    dosen: user.dosen,
    mahasiswa: user.mahasiswa,
    units,
    org_scope: computeOrgScope({ ...user, role: primary, roles, units: user.units || [] }),
  };
};

const findUserWithAccess = (where) => User.findOne({ where, include: ACCESS_INCLUDE });

const getUserAccessById = async (id, { required = true, notFoundCode = 401 } = {}) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password', 'remember_token'] }, include: ACCESS_INCLUDE });
  if (!user && required) throw new AppError('User tidak ditemukan', notFoundCode);
  return user;
};

module.exports = { ACCESS_INCLUDE, collectPermissions, toAccessPayload, findUserWithAccess, getUserAccessById };

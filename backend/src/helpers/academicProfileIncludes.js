'use strict';

const { ProgramStudi, Departemen, Fakultas, User, Role } = require('../models');

const programStudiWithOrganization = () => ({
  model: ProgramStudi,
  as: 'programStudi',
  paranoid: false,
  include: [
    { model: Departemen, as: 'departemen', paranoid: false },
    { model: Fakultas, as: 'fakultas', paranoid: false },
  ],
});

const accountWithRoles = () => ({
  model: User,
  as: 'user',
  paranoid: false,
  attributes: ['id', 'name', 'email', 'deletedAt'],
  include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
});

module.exports = { programStudiWithOrganization, accountWithRoles };

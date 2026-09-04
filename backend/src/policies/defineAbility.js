'use strict';

const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const { SUBJECT_BY_KEY } = require('../constants/permissions');
const { isUniversityAdminRole } = require('../constants/roles');

const parsePermission = (name) => {
  const [key, ...rest] = String(name).split('.');
  const action = rest.join('.');
  const subject = SUBJECT_BY_KEY[key];
  if (!subject || !action) return null;
  return { action, subject };
};

const defineAbility = (user, permissions = [], roleNames = []) => {
  const { can, build } = new AbilityBuilder(createMongoAbility);
  const names = new Set(roleNames);
  if (user?.role) names.add(user.role);

  if ([...names].some(isUniversityAdminRole)) {
    can('manage', 'all');
    return build();
  }

  for (const permission of permissions) {
    const parsed = parsePermission(permission);
    if (!parsed) continue;
    can(parsed.action, parsed.subject);
  }

  return build();
};

module.exports = {
  defineAbility,
  parsePermission,
};

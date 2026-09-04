'use strict';

const { getUserAccessById, collectPermissions } = require('../helpers/userAccess');
const { defineAbility } = require('../policies/defineAbility');
const asyncHandler = require('./asyncHandler');

const attachAbility = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    req.ability = defineAbility(null, [], []);
    return next();
  }

  const user = await getUserAccessById(req.user.id, { required: false });
  const roleNames = (user?.roles || []).map((role) => role.name);
  if (req.user.role) roleNames.push(req.user.role);
  const permissions = user ? collectPermissions(user) : [];
  req.ability = defineAbility(req.user, permissions, roleNames);
  req.access = user;
  return next();
});

module.exports = attachAbility;

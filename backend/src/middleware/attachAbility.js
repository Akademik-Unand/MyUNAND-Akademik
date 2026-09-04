'use strict';

const { getUserAccessById, collectPermissions } = require('../helpers/userAccess');
const { defineAbility } = require('../policies/defineAbility');
const { computeOrgScope, orgFilterForResource } = require('../helpers/orgScope');
const asyncHandler = require('./asyncHandler');

const resourceName = (req) => String(req.baseUrl || '').split('/')[2] || '';

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

  const scope = computeOrgScope(user);
  req.orgScope = scope;
  const orgFilter = orgFilterForResource(resourceName(req), scope);
  if (orgFilter) {
    const existing =
      req.query.filter && typeof req.query.filter === 'object' && !Array.isArray(req.query.filter)
        ? { ...req.query.filter }
        : {};
    const merged = { ...existing, ...orgFilter };
    Object.defineProperty(req, 'query', {
      value: { ...req.query, filter: merged },
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  return next();
});

module.exports = attachAbility;
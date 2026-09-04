'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const rolesValidation = require('../../validations/iam/roles.validation');
const rolesController = require('../../controllers/iam/roles.controller');

const subject = 'Role';

/** GET /roles */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: rolesValidation.list }),
  rolesController.list
);

/** GET /roles/matrix */
router.get(
  '/matrix',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  rolesController.matrix
);

/** POST /roles */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: rolesValidation.create }),
  rolesController.create
);

/** PUT /roles/:id/permissions */
router.put(
  '/:id/permissions',
  authenticate,
  attachAbility,
  checkPermission('sync-permissions', subject),
  validate({ params: rolesValidation.idParam, body: rolesValidation.syncPermissions }),
  rolesController.syncPermissions
);

/** POST /roles/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: rolesValidation.idParam }),
  rolesController.restore
);

/** GET /roles/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: rolesValidation.idParam }),
  rolesController.getById
);

/** PUT /roles/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: rolesValidation.idParam, body: rolesValidation.update }),
  rolesController.update
);

/** DELETE /roles/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: rolesValidation.idParam }),
  rolesController.remove
);

module.exports = router;

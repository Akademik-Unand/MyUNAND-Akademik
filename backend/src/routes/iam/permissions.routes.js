'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const permissionsValidation = require('../../validations/iam/permissions.validation');
const permissionsController = require('../../controllers/iam/permissions.controller');

const subject = 'Permission';

/** GET /permissions */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: permissionsValidation.list }),
  permissionsController.list
);

/** POST /permissions */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: permissionsValidation.create }),
  permissionsController.create
);

/** POST /permissions/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: permissionsValidation.idParam }),
  permissionsController.restore
);

/** GET /permissions/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: permissionsValidation.idParam }),
  permissionsController.getById
);

/** PUT /permissions/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: permissionsValidation.idParam, body: permissionsValidation.update }),
  permissionsController.update
);

/** DELETE /permissions/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: permissionsValidation.idParam }),
  permissionsController.remove
);

module.exports = router;

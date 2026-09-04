'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const dosenValidation = require('../../validations/institusi/dosen.validation');
const dosenController = require('../../controllers/institusi/dosen.controller');

const subject = 'Dosen';

/dosen */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: dosenValidation.list }),
  dosenController.list
);

/** POST /dosen */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: dosenValidation.create }),
  dosenController.create
);

/** POST /dosen/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: dosenValidation.idParam }),
  dosenController.restore
);

/** GET /dosen/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: dosenValidation.idParam }),
  dosenController.getById
);

/** PUT /dosen/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: dosenValidation.idParam, body: dosenValidation.update }),
  dosenController.update
);

/** DELETE /dosen/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: dosenValidation.idParam }),
  dosenController.remove
);

module.exports = router;

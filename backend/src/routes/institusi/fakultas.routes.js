'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const fakultasValidation = require('../../validations/institusi/fakultas.validation');
const fakultasController = require('../../controllers/institusi/fakultas.controller');

const subject = 'Fakultas';

/fakultas */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: fakultasValidation.list }),
  fakultasController.list
);

/** POST /fakultas */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: fakultasValidation.create }),
  fakultasController.create
);

/** POST /fakultas/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: fakultasValidation.idParam }),
  fakultasController.restore
);

/** GET /fakultas/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: fakultasValidation.idParam }),
  fakultasController.getById
);

/** PUT /fakultas/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: fakultasValidation.idParam, body: fakultasValidation.update }),
  fakultasController.update
);

/** DELETE /fakultas/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: fakultasValidation.idParam }),
  fakultasController.remove
);

module.exports = router;

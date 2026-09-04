'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const kelasValidation = require('../../validations/perkuliahan/kelas.validation');
const kelasController = require('../../controllers/perkuliahan/kelas.controller');

const subject = 'Kelas';

/kelas */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: kelasValidation.list }),
  kelasController.list
);

/** POST /kelas */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: kelasValidation.create }),
  kelasController.create
);

/** POST /kelas/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: kelasValidation.idParam }),
  kelasController.restore
);

/** GET /kelas/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: kelasValidation.idParam }),
  kelasController.getById
);

/** PUT /kelas/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: kelasValidation.idParam, body: kelasValidation.update }),
  kelasController.update
);

/** DELETE /kelas/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: kelasValidation.idParam }),
  kelasController.remove
);

module.exports = router;

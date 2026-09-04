'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const sumberPenilaianValidation = require('../../validations/obe/sumber-penilaian.validation');
const sumberPenilaianController = require('../../controllers/obe/sumber-penilaian.controller');

const subject = 'SumberPenilaian';

/** GET /sumber-penilaian */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: sumberPenilaianValidation.list }),
  sumberPenilaianController.list
);

/** POST /sumber-penilaian */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: sumberPenilaianValidation.create }),
  sumberPenilaianController.create
);

/** GET /sumber-penilaian/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: sumberPenilaianValidation.idParam }),
  sumberPenilaianController.getById
);

/** PUT /sumber-penilaian/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: sumberPenilaianValidation.idParam, body: sumberPenilaianValidation.update }),
  sumberPenilaianController.update
);

/** DELETE /sumber-penilaian/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: sumberPenilaianValidation.idParam }),
  sumberPenilaianController.remove
);

module.exports = router;

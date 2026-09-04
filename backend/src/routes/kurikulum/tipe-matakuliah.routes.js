'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const tipeMatakuliahValidation = require('../../validations/kurikulum/tipe-matakuliah.validation');
const tipeMatakuliahController = require('../../controllers/kurikulum/tipe-matakuliah.controller');

const subject = 'TipeMatakuliah';

/** GET /tipe-matakuliah */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: tipeMatakuliahValidation.list }),
  tipeMatakuliahController.list
);

/** POST /tipe-matakuliah */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: tipeMatakuliahValidation.create }),
  tipeMatakuliahController.create
);

/** GET /tipe-matakuliah/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: tipeMatakuliahValidation.idParam }),
  tipeMatakuliahController.getById
);

/** PUT /tipe-matakuliah/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: tipeMatakuliahValidation.idParam, body: tipeMatakuliahValidation.update }),
  tipeMatakuliahController.update
);

/** DELETE /tipe-matakuliah/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: tipeMatakuliahValidation.idParam }),
  tipeMatakuliahController.remove
);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const sifatMatakuliahValidation = require('../../validations/kurikulum/sifat-matakuliah.validation');
const sifatMatakuliahController = require('../../controllers/kurikulum/sifat-matakuliah.controller');

const subject = 'SifatMatakuliah';

/** GET /sifat-matakuliah */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: sifatMatakuliahValidation.list }),
  sifatMatakuliahController.list
);

/** POST /sifat-matakuliah */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: sifatMatakuliahValidation.create }),
  sifatMatakuliahController.create
);

/** GET /sifat-matakuliah/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: sifatMatakuliahValidation.idParam }),
  sifatMatakuliahController.getById
);

/** PUT /sifat-matakuliah/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: sifatMatakuliahValidation.idParam, body: sifatMatakuliahValidation.update }),
  sifatMatakuliahController.update
);

/** DELETE /sifat-matakuliah/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: sifatMatakuliahValidation.idParam }),
  sifatMatakuliahController.remove
);

module.exports = router;

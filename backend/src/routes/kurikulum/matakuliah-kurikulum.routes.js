'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const matakuliahKurikulumValidation = require('../../validations/kurikulum/matakuliah-kurikulum.validation');
const matakuliahKurikulumController = require('../../controllers/kurikulum/matakuliah-kurikulum.controller');

const subject = 'MatakuliahKurikulum';

/** GET /matakuliah-kurikulum */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: matakuliahKurikulumValidation.list }),
  matakuliahKurikulumController.list
);

/** POST /matakuliah-kurikulum */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: matakuliahKurikulumValidation.create }),
  matakuliahKurikulumController.create
);

/** GET /matakuliah-kurikulum/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: matakuliahKurikulumValidation.idParam }),
  matakuliahKurikulumController.getById
);

/** PUT /matakuliah-kurikulum/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: matakuliahKurikulumValidation.idParam, body: matakuliahKurikulumValidation.update }),
  matakuliahKurikulumController.update
);

/** DELETE /matakuliah-kurikulum/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: matakuliahKurikulumValidation.idParam }),
  matakuliahKurikulumController.remove
);

module.exports = router;

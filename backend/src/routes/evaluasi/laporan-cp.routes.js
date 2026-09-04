'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const laporanCpValidation = require('../../validations/evaluasi/laporan-cp.validation');
const laporanCpController = require('../../controllers/evaluasi/laporan-cp.controller');

const subject = 'LaporanCp';

/** GET /laporan-cp */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: laporanCpValidation.list }),
  laporanCpController.list
);

/** POST /laporan-cp */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: laporanCpValidation.create }),
  laporanCpController.create
);

/** GET /laporan-cp/preview */
router.get(
  '/preview',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: laporanCpValidation.preview }),
  laporanCpController.preview
);

/** GET /laporan-cp/matakuliah/:matakuliahId */
router.get(
  '/matakuliah/:matakuliahId',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: laporanCpValidation.matakuliahParam, query: laporanCpValidation.matakuliahQuery }),
  laporanCpController.matakuliahDetail
);

/** GET /laporan-cp/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: laporanCpValidation.idParam }),
  laporanCpController.getById
);

/** PUT /laporan-cp/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: laporanCpValidation.idParam, body: laporanCpValidation.update }),
  laporanCpController.update
);

/** DELETE /laporan-cp/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: laporanCpValidation.idParam }),
  laporanCpController.remove
);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const rekapCpValidation = require('../../validations/evaluasi/rekap-cp.validation');
const rekapCpController = require('../../controllers/evaluasi/rekap-cp.controller');

const subject = 'RekapCp';

/** GET /rekap-cp */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: rekapCpValidation.list }),
  rekapCpController.list
);

/** POST /rekap-cp */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: rekapCpValidation.create }),
  rekapCpController.create
);

/** GET /rekap-cp/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: rekapCpValidation.idParam }),
  rekapCpController.getById
);

/** PUT /rekap-cp/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: rekapCpValidation.idParam, body: rekapCpValidation.update }),
  rekapCpController.update
);

/** DELETE /rekap-cp/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: rekapCpValidation.idParam }),
  rekapCpController.remove
);

module.exports = router;

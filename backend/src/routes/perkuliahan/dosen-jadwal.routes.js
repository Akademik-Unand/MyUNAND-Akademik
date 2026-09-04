'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const dosenJadwalValidation = require('../../validations/perkuliahan/dosen-jadwal.validation');
const dosenJadwalController = require('../../controllers/perkuliahan/dosen-jadwal.controller');

const subject = 'DosenJadwal';

/** GET /dosen-jadwal */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: dosenJadwalValidation.list }),
  dosenJadwalController.list
);

/** POST /dosen-jadwal */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: dosenJadwalValidation.create }),
  dosenJadwalController.create
);

/** GET /dosen-jadwal/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: dosenJadwalValidation.idParam }),
  dosenJadwalController.getById
);

/** PUT /dosen-jadwal/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: dosenJadwalValidation.idParam, body: dosenJadwalValidation.update }),
  dosenJadwalController.update
);

/** DELETE /dosen-jadwal/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: dosenJadwalValidation.idParam }),
  dosenJadwalController.remove
);

module.exports = router;

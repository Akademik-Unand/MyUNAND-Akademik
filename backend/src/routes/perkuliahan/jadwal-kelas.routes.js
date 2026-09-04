'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const jadwalKelasValidation = require('../../validations/perkuliahan/jadwal-kelas.validation');
const jadwalKelasController = require('../../controllers/perkuliahan/jadwal-kelas.controller');

const subject = 'JadwalKelas';

/** GET /jadwal-kelas */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: jadwalKelasValidation.list }),
  jadwalKelasController.list
);

/** POST /jadwal-kelas */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: jadwalKelasValidation.create }),
  jadwalKelasController.create
);

/** GET /jadwal-kelas/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: jadwalKelasValidation.idParam }),
  jadwalKelasController.getById
);

/** PUT /jadwal-kelas/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: jadwalKelasValidation.idParam, body: jadwalKelasValidation.update }),
  jadwalKelasController.update
);

/** DELETE /jadwal-kelas/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: jadwalKelasValidation.idParam }),
  jadwalKelasController.remove
);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const dosenKelasValidation = require('../../validations/perkuliahan/dosen-kelas.validation');
const dosenKelasController = require('../../controllers/perkuliahan/dosen-kelas.controller');

const subject = 'DosenKelas';

/** GET /dosen-kelas */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: dosenKelasValidation.list }),
  dosenKelasController.list
);

/** POST /dosen-kelas */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: dosenKelasValidation.create }),
  dosenKelasController.create
);

/** GET /dosen-kelas/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: dosenKelasValidation.idParam }),
  dosenKelasController.getById
);

/** PUT /dosen-kelas/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: dosenKelasValidation.idParam, body: dosenKelasValidation.update }),
  dosenKelasController.update
);

/** DELETE /dosen-kelas/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: dosenKelasValidation.idParam }),
  dosenKelasController.remove
);

module.exports = router;

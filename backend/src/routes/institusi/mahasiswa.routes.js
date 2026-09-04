'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const mahasiswaValidation = require('../../validations/institusi/mahasiswa.validation');
const mahasiswaController = require('../../controllers/institusi/mahasiswa.controller');

const subject = 'Mahasiswa';

/mahasiswa */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: mahasiswaValidation.list }),
  mahasiswaController.list
);

/** POST /mahasiswa */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: mahasiswaValidation.create }),
  mahasiswaController.create
);

/** POST /mahasiswa/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: mahasiswaValidation.idParam }),
  mahasiswaController.restore
);

/** GET /mahasiswa/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: mahasiswaValidation.idParam }),
  mahasiswaController.getById
);

/** PUT /mahasiswa/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: mahasiswaValidation.idParam, body: mahasiswaValidation.update }),
  mahasiswaController.update
);

/** DELETE /mahasiswa/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: mahasiswaValidation.idParam }),
  mahasiswaController.remove
);

module.exports = router;

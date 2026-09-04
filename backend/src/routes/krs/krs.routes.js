'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const krsValidation = require('../../validations/krs/krs.validation');
const krsController = require('../../controllers/krs/krs.controller');

const subject = 'Krs';

/** GET /krs */
router.get('/', authenticate, attachAbility, checkPermission('read', subject), validate({ query: krsValidation.list }), krsController.list);

/** POST /krs */
router.post('/', authenticate, attachAbility, checkPermission('create', subject), validate({ body: krsValidation.create }), krsController.create);

/** PATCH /krs/:id/approve */
router.patch(
  '/:id/approve',
  authenticate,
  attachAbility,
  checkPermission('approve', subject),
  validate({ params: krsValidation.idParam, body: krsValidation.approve }),
  krsController.approve
);

/** PATCH /krs/detil/:detilId/status */
router.patch(
  '/detil/:detilId/status',
  authenticate,
  attachAbility,
  checkPermission('update', 'KrsDetil'),
  validate({ params: krsValidation.detilIdParam, body: krsValidation.detilStatus }),
  krsController.updateDetilStatus
);

/** GET /krs/mahasiswa/:mahasiswaId */
router.get(
  '/mahasiswa/:mahasiswaId',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: krsValidation.mahasiswaIdParam }),
  krsController.getByMahasiswa
);

/** GET /krs/:id */
router.get('/:id', authenticate, attachAbility, checkPermission('read', subject), validate({ params: krsValidation.idParam }), krsController.getById);

/** PUT /krs/:id */
router.put('/:id', authenticate, attachAbility, checkPermission('update', subject), validate({ params: krsValidation.idParam, body: krsValidation.update }), krsController.update);

/** DELETE /krs/:id */
router.delete('/:id', authenticate, attachAbility, checkPermission('delete', subject), validate({ params: krsValidation.idParam }), krsController.remove);

module.exports = router;

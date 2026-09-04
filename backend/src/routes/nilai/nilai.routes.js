'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const nilaiValidation = require('../../validations/nilai/nilai.validation');
const nilaiController = require('../../controllers/nilai/nilai.controller');

const subject = 'NilaiMahasiswa';

/** GET /nilai */
router.get('/', authenticate, attachAbility, checkPermission('read', subject), validate({ query: nilaiValidation.list }), nilaiController.list);

/** POST /nilai */
router.post('/', authenticate, attachAbility, checkPermission('create', subject), validate({ body: nilaiValidation.create }), nilaiController.create);

/** POST /nilai/upload */
router.post(
  '/upload',
  authenticate,
  attachAbility,
  checkPermission('upload', subject),
  validate({ body: nilaiValidation.upload }),
  nilaiController.uploadBulk
);

/** GET /nilai/kelas/:kelasId/matriks */
router.get(
  '/kelas/:kelasId/matriks',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: nilaiValidation.kelasIdParam }),
  nilaiController.getMatriks
);

/** GET /nilai/:id */
router.get('/:id', authenticate, attachAbility, checkPermission('read', subject), validate({ params: nilaiValidation.idParam }), nilaiController.getById);

/** PUT /nilai/:id */
router.put('/:id', authenticate, attachAbility, checkPermission('update', subject), validate({ params: nilaiValidation.idParam, body: nilaiValidation.update }), nilaiController.update);

/** DELETE /nilai/:id */
router.delete('/:id', authenticate, attachAbility, checkPermission('delete', subject), validate({ params: nilaiValidation.idParam }), nilaiController.remove);

module.exports = router;

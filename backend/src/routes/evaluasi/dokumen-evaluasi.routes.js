'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const dokumenEvaluasiValidation = require('../../validations/evaluasi/dokumen-evaluasi.validation');
const dokumenEvaluasiController = require('../../controllers/evaluasi/dokumen-evaluasi.controller');

const subject = 'DokumenEvaluasi';

router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: dokumenEvaluasiValidation.list }),
  dokumenEvaluasiController.list
);

router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: dokumenEvaluasiValidation.create }),
  dokumenEvaluasiController.create
);

router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: dokumenEvaluasiValidation.idParam }),
  dokumenEvaluasiController.getById
);

router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: dokumenEvaluasiValidation.idParam, body: dokumenEvaluasiValidation.update }),
  dokumenEvaluasiController.update
);

router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: dokumenEvaluasiValidation.idParam }),
  dokumenEvaluasiController.remove
);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const jenisDokumenEvaluasiValidation = require('../../validations/evaluasi/jenis-dokumen-evaluasi.validation');
const jenisDokumenEvaluasiController = require('../../controllers/evaluasi/jenis-dokumen-evaluasi.controller');

const subject = 'JenisDokumenEvaluasi';

router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: jenisDokumenEvaluasiValidation.list }),
  jenisDokumenEvaluasiController.list
);

router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: jenisDokumenEvaluasiValidation.create }),
  jenisDokumenEvaluasiController.create
);

router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: jenisDokumenEvaluasiValidation.idParam }),
  jenisDokumenEvaluasiController.restore
);

router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: jenisDokumenEvaluasiValidation.idParam }),
  jenisDokumenEvaluasiController.getById
);

router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: jenisDokumenEvaluasiValidation.idParam, body: jenisDokumenEvaluasiValidation.update }),
  jenisDokumenEvaluasiController.update
);

router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: jenisDokumenEvaluasiValidation.idParam }),
  jenisDokumenEvaluasiController.remove
);

module.exports = router;

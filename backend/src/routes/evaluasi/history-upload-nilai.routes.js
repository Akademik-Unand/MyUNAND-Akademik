'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const historyUploadNilaiValidation = require('../../validations/evaluasi/history-upload-nilai.validation');
const historyUploadNilaiController = require('../../controllers/evaluasi/history-upload-nilai.controller');

const subject = 'HistoryUploadNilai';

/** GET /history-upload-nilai */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: historyUploadNilaiValidation.list }),
  historyUploadNilaiController.list
);

/** POST /history-upload-nilai */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: historyUploadNilaiValidation.create }),
  historyUploadNilaiController.create
);

/** GET /history-upload-nilai/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: historyUploadNilaiValidation.idParam }),
  historyUploadNilaiController.getById
);

/** PUT /history-upload-nilai/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: historyUploadNilaiValidation.idParam, body: historyUploadNilaiValidation.update }),
  historyUploadNilaiController.update
);

/** DELETE /history-upload-nilai/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: historyUploadNilaiValidation.idParam }),
  historyUploadNilaiController.remove
);

module.exports = router;

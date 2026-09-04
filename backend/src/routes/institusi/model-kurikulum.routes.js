'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const modelKurikulumValidation = require('../../validations/institusi/model-kurikulum.validation');
const modelKurikulumController = require('../../controllers/institusi/model-kurikulum.controller');

const subject = 'ModelKurikulum';

/model-kurikulum */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: modelKurikulumValidation.list }),
  modelKurikulumController.list
);

/** POST /model-kurikulum */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: modelKurikulumValidation.create }),
  modelKurikulumController.create
);

/** POST /model-kurikulum/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: modelKurikulumValidation.idParam }),
  modelKurikulumController.restore
);

/** GET /model-kurikulum/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: modelKurikulumValidation.idParam }),
  modelKurikulumController.getById
);

/** PUT /model-kurikulum/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: modelKurikulumValidation.idParam, body: modelKurikulumValidation.update }),
  modelKurikulumController.update
);

/** DELETE /model-kurikulum/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: modelKurikulumValidation.idParam }),
  modelKurikulumController.remove
);

module.exports = router;

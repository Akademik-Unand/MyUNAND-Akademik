'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const universitasValidation = require('../../validations/institusi/universitas.validation');
const universitasController = require('../../controllers/institusi/universitas.controller');

const subject = 'Universitas';

/universitas */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: universitasValidation.list }),
  universitasController.list
);

/** POST /universitas */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: universitasValidation.create }),
  universitasController.create
);

/** POST /universitas/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: universitasValidation.idParam }),
  universitasController.restore
);

/** GET /universitas/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: universitasValidation.idParam }),
  universitasController.getById
);

/** PUT /universitas/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: universitasValidation.idParam, body: universitasValidation.update }),
  universitasController.update
);

/** DELETE /universitas/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: universitasValidation.idParam }),
  universitasController.remove
);

module.exports = router;

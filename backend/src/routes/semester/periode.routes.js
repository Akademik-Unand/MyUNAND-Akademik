'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const periodeValidation = require('../../validations/semester/periode.validation');
const periodeController = require('../../controllers/semester/periode.controller');

const subject = 'Periode';

router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: periodeValidation.list }),
  periodeController.list
);

router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: periodeValidation.create }),
  periodeController.create
);

router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: periodeValidation.idParam }),
  periodeController.restore
);

router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: periodeValidation.idParam }),
  periodeController.getById
);

router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: periodeValidation.idParam, body: periodeValidation.update }),
  periodeController.update
);

router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: periodeValidation.idParam }),
  periodeController.remove
);

module.exports = router;

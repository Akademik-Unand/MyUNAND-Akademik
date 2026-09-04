'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const krsDetilValidation = require('../../validations/krs/krs-detil.validation');
const krsDetilController = require('../../controllers/krs/krs-detil.controller');

const subject = 'KrsDetil';

/** GET /krs-detil */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: krsDetilValidation.list }),
  krsDetilController.list
);

/** POST /krs-detil */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: krsDetilValidation.create }),
  krsDetilController.create
);

/** GET /krs-detil/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: krsDetilValidation.idParam }),
  krsDetilController.getById
);

/** PUT /krs-detil/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: krsDetilValidation.idParam, body: krsDetilValidation.update }),
  krsDetilController.update
);

/** DELETE /krs-detil/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: krsDetilValidation.idParam }),
  krsDetilController.remove
);

module.exports = router;

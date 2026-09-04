'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const programStudiValidation = require('../../validations/institusi/program-studi.validation');
const programStudiController = require('../../controllers/institusi/program-studi.controller');

const subject = 'ProgramStudi';

/program-studi */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: programStudiValidation.list }),
  programStudiController.list
);

/** POST /program-studi */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: programStudiValidation.create }),
  programStudiController.create
);

/** POST /program-studi/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: programStudiValidation.idParam }),
  programStudiController.restore
);

/** GET /program-studi/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: programStudiValidation.idParam }),
  programStudiController.getById
);

/** PUT /program-studi/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: programStudiValidation.idParam, body: programStudiValidation.update }),
  programStudiController.update
);

/** DELETE /program-studi/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: programStudiValidation.idParam }),
  programStudiController.remove
);

module.exports = router;

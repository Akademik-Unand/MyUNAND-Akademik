'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const cpValidation = require('../../validations/obe/cp.validation');
const cpController = require('../../controllers/obe/cp.controller');

const subject = 'Cp';

/cp */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: cpValidation.list }),
  cpController.list
);

/** POST /cp */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: cpValidation.create }),
  cpController.create
);

/** POST /cp/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: cpValidation.idParam }),
  cpController.restore
);

/** GET /cp/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: cpValidation.idParam }),
  cpController.getById
);

/** PUT /cp/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: cpValidation.idParam, body: cpValidation.update }),
  cpController.update
);

/** DELETE /cp/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: cpValidation.idParam }),
  cpController.remove
);

module.exports = router;

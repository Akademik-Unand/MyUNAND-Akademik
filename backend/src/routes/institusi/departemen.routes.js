'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const departemenValidation = require('../../validations/institusi/departemen.validation');
const departemenController = require('../../controllers/institusi/departemen.controller');

const subject = 'Departemen';

/departemen */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: departemenValidation.list }),
  departemenController.list
);

/** POST /departemen */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: departemenValidation.create }),
  departemenController.create
);

/** POST /departemen/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: departemenValidation.idParam }),
  departemenController.restore
);

/** GET /departemen/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: departemenValidation.idParam }),
  departemenController.getById
);

/** PUT /departemen/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: departemenValidation.idParam, body: departemenValidation.update }),
  departemenController.update
);

/** DELETE /departemen/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: departemenValidation.idParam }),
  departemenController.remove
);

module.exports = router;

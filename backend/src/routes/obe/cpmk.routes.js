'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const cpmkValidation = require('../../validations/obe/cpmk.validation');
const cpmkController = require('../../controllers/obe/cpmk.controller');

const subject = 'Cpmk';

/cpmk */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: cpmkValidation.list }),
  cpmkController.list
);

/** POST /cpmk */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: cpmkValidation.create }),
  cpmkController.create
);

/** POST /cpmk/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: cpmkValidation.idParam }),
  cpmkController.restore
);

/** GET /cpmk/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: cpmkValidation.idParam }),
  cpmkController.getById
);

/** PUT /cpmk/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: cpmkValidation.idParam, body: cpmkValidation.update }),
  cpmkController.update
);

/** DELETE /cpmk/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: cpmkValidation.idParam }),
  cpmkController.remove
);

module.exports = router;

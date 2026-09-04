'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const cpmkScpValidation = require('../../validations/obe/cpmk-scp.validation');
const cpmkScpController = require('../../controllers/obe/cpmk-scp.controller');

const subject = 'CpmkScp';

/** GET /cpmk-scp */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: cpmkScpValidation.list }),
  cpmkScpController.list
);

/** POST /cpmk-scp */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: cpmkScpValidation.create }),
  cpmkScpController.create
);

/** GET /cpmk-scp/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: cpmkScpValidation.idParam }),
  cpmkScpController.getById
);

/** PUT /cpmk-scp/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: cpmkScpValidation.idParam, body: cpmkScpValidation.update }),
  cpmkScpController.update
);

/** DELETE /cpmk-scp/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: cpmkScpValidation.idParam }),
  cpmkScpController.remove
);

module.exports = router;

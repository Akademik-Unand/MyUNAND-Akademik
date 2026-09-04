'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const scpValidation = require('../../validations/obe/scp.validation');
const scpController = require('../../controllers/obe/scp.controller');

const subject = 'Scp';

/scp */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: scpValidation.list }),
  scpController.list
);

/** POST /scp */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: scpValidation.create }),
  scpController.create
);

/** POST /scp/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: scpValidation.idParam }),
  scpController.restore
);

/** GET /scp/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: scpValidation.idParam }),
  scpController.getById
);

/** PUT /scp/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: scpValidation.idParam, body: scpValidation.update }),
  scpController.update
);

/** DELETE /scp/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: scpValidation.idParam }),
  scpController.remove
);

module.exports = router;

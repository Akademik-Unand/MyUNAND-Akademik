'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const activityLogsValidation = require('../../validations/iam/activity-logs.validation');
const activityLogsController = require('../../controllers/iam/activity-logs.controller');

const subject = 'ActivityLog';

/** GET /activity-logs */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: activityLogsValidation.list }),
  activityLogsController.list
);

/** GET /activity-logs/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: activityLogsValidation.idParam }),
  activityLogsController.getById
);

module.exports = router;

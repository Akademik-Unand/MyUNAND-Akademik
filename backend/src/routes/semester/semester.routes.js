'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const semesterValidation = require('../../validations/semester/semester.validation');
const semesterController = require('../../controllers/semester/semester.controller');

const subject = 'Semester';

/semester */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: semesterValidation.list }),
  semesterController.list
);

/** POST /semester */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: semesterValidation.create }),
  semesterController.create
);

/** POST /semester/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: semesterValidation.idParam }),
  semesterController.restore
);

/** GET /semester/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: semesterValidation.idParam }),
  semesterController.getById
);

/** PUT /semester/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: semesterValidation.idParam, body: semesterValidation.update }),
  semesterController.update
);

/** DELETE /semester/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: semesterValidation.idParam }),
  semesterController.remove
);

module.exports = router;

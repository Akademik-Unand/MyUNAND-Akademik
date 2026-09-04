'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const jenisSemesterValidation = require('../../validations/semester/jenis-semester.validation');
const jenisSemesterController = require('../../controllers/semester/jenis-semester.controller');

const subject = 'JenisSemester';

/jenis-semester */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: jenisSemesterValidation.list }),
  jenisSemesterController.list
);

/** POST /jenis-semester */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: jenisSemesterValidation.create }),
  jenisSemesterController.create
);

/** POST /jenis-semester/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: jenisSemesterValidation.idParam }),
  jenisSemesterController.restore
);

/** GET /jenis-semester/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: jenisSemesterValidation.idParam }),
  jenisSemesterController.getById
);

/** PUT /jenis-semester/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: jenisSemesterValidation.idParam, body: jenisSemesterValidation.update }),
  jenisSemesterController.update
);

/** DELETE /jenis-semester/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: jenisSemesterValidation.idParam }),
  jenisSemesterController.remove
);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const semesterProdiValidation = require('../../validations/semester/semester-prodi.validation');
const semesterProdiController = require('../../controllers/semester/semester-prodi.controller');

const subject = 'SemesterProdi';

/** GET /semester-prodi */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: semesterProdiValidation.list }),
  semesterProdiController.list
);

/** POST /semester-prodi */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: semesterProdiValidation.create }),
  semesterProdiController.create
);

/** GET /semester-prodi/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: semesterProdiValidation.idParam }),
  semesterProdiController.getById
);

/** PUT /semester-prodi/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: semesterProdiValidation.idParam, body: semesterProdiValidation.update }),
  semesterProdiController.update
);

/** DELETE /semester-prodi/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: semesterProdiValidation.idParam }),
  semesterProdiController.remove
);

module.exports = router;

'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const matakuliahValidation = require('../../validations/kurikulum/matakuliah.validation');
const matakuliahController = require('../../controllers/kurikulum/matakuliah.controller');

const subject = 'Matakuliah';

/matakuliah */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: matakuliahValidation.list }),
  matakuliahController.list
);

/** POST /matakuliah */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: matakuliahValidation.create }),
  matakuliahController.create
);

/** POST /matakuliah/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: matakuliahValidation.idParam }),
  matakuliahController.restore
);

/** GET /matakuliah/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: matakuliahValidation.idParam }),
  matakuliahController.getById
);

/** PUT /matakuliah/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: matakuliahValidation.idParam, body: matakuliahValidation.update }),
  matakuliahController.update
);

/** DELETE /matakuliah/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: matakuliahValidation.idParam }),
  matakuliahController.remove
);

module.exports = router;

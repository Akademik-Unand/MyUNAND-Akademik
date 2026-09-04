'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const jenjangAkademikValidation = require('../../validations/institusi/jenjang-akademik.validation');
const jenjangAkademikController = require('../../controllers/institusi/jenjang-akademik.controller');

const subject = 'JenjangAkademik';

/** GET /jenjang-akademik */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: jenjangAkademikValidation.list }),
  jenjangAkademikController.list
);

/** POST /jenjang-akademik */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: jenjangAkademikValidation.create }),
  jenjangAkademikController.create
);

/** POST /jenjang-akademik/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: jenjangAkademikValidation.idParam }),
  jenjangAkademikController.restore
);

/** GET /jenjang-akademik/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: jenjangAkademikValidation.idParam }),
  jenjangAkademikController.getById
);

/** PUT /jenjang-akademik/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: jenjangAkademikValidation.idParam, body: jenjangAkademikValidation.update }),
  jenjangAkademikController.update
);

/** DELETE /jenjang-akademik/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: jenjangAkademikValidation.idParam }),
  jenjangAkademikController.remove
);

module.exports = router;

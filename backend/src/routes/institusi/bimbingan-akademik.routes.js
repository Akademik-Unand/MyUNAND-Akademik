'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const bimbinganAkademikValidation = require('../../validations/institusi/bimbingan-akademik.validation');
const bimbinganAkademikController = require('../../controllers/institusi/bimbingan-akademik.controller');

const subject = 'BimbinganAkademik';

/** GET /bimbingan-akademik */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: bimbinganAkademikValidation.list }),
  bimbinganAkademikController.list
);

/** POST /bimbingan-akademik */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: bimbinganAkademikValidation.create }),
  bimbinganAkademikController.create
);

/** GET /bimbingan-akademik/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: bimbinganAkademikValidation.idParam }),
  bimbinganAkademikController.getById
);

/** PUT /bimbingan-akademik/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: bimbinganAkademikValidation.idParam, body: bimbinganAkademikValidation.update }),
  bimbinganAkademikController.update
);

/** DELETE /bimbingan-akademik/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: bimbinganAkademikValidation.idParam }),
  bimbinganAkademikController.remove
);

module.exports = router;

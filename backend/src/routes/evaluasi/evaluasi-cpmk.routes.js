'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const evaluasiCpmkValidation = require('../../validations/evaluasi/evaluasi-cpmk.validation');
const evaluasiCpmkController = require('../../controllers/evaluasi/evaluasi-cpmk.controller');

const subject = 'EvaluasiCpmk';

/** GET /evaluasi-cpmk */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: evaluasiCpmkValidation.list }),
  evaluasiCpmkController.list
);

/** POST /evaluasi-cpmk */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: evaluasiCpmkValidation.create }),
  evaluasiCpmkController.create
);

/** GET /evaluasi-cpmk/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: evaluasiCpmkValidation.idParam }),
  evaluasiCpmkController.getById
);

/** PUT /evaluasi-cpmk/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: evaluasiCpmkValidation.idParam, body: evaluasiCpmkValidation.update }),
  evaluasiCpmkController.update
);

/** DELETE /evaluasi-cpmk/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: evaluasiCpmkValidation.idParam }),
  evaluasiCpmkController.remove
);

module.exports = router;

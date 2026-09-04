'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const ruangValidation = require('../../validations/perkuliahan/ruang.validation');
const ruangController = require('../../controllers/perkuliahan/ruang.controller');

const subject = 'Ruang';

/ruang */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: ruangValidation.list }),
  ruangController.list
);

/** POST /ruang */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: ruangValidation.create }),
  ruangController.create
);

/** POST /ruang/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: ruangValidation.idParam }),
  ruangController.restore
);

/** GET /ruang/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: ruangValidation.idParam }),
  ruangController.getById
);

/** PUT /ruang/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: ruangValidation.idParam, body: ruangValidation.update }),
  ruangController.update
);

/** DELETE /ruang/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: ruangValidation.idParam }),
  ruangController.remove
);

module.exports = router;

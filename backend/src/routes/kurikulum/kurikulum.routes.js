'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const kurikulumValidation = require('../../validations/kurikulum/kurikulum.validation');
const kurikulumController = require('../../controllers/kurikulum/kurikulum.controller');

const subject = 'Kurikulum';

/kurikulum */
router.get(
  '/',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ query: kurikulumValidation.list }),
  kurikulumController.list
);

/** POST /kurikulum */
router.post(
  '/',
  authenticate,
  attachAbility,
  checkPermission('create', subject),
  validate({ body: kurikulumValidation.create }),
  kurikulumController.create
);

/** POST /kurikulum/:id/restore */
router.post(
  '/:id/restore',
  authenticate,
  attachAbility,
  checkPermission('restore', subject),
  validate({ params: kurikulumValidation.idParam }),
  kurikulumController.restore
);

/** GET /kurikulum/:id */
router.get(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('read', subject),
  validate({ params: kurikulumValidation.idParam }),
  kurikulumController.getById
);

/** PUT /kurikulum/:id */
router.put(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('update', subject),
  validate({ params: kurikulumValidation.idParam, body: kurikulumValidation.update }),
  kurikulumController.update
);

/** DELETE /kurikulum/:id */
router.delete(
  '/:id',
  authenticate,
  attachAbility,
  checkPermission('delete', subject),
  validate({ params: kurikulumValidation.idParam }),
  kurikulumController.remove
);

module.exports = router;

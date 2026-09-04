'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const usersValidation = require('../../validations/iam/users.validation');
const usersController = require('../../controllers/iam/users.controller');

const subject = 'User';

/** GET /users */
router.get('/', authenticate, attachAbility, checkPermission('read', subject), validate({ query: usersValidation.list }), usersController.list);

/** POST /users */
router.post('/', authenticate, attachAbility, checkPermission('create', subject), validate({ body: usersValidation.create }), usersController.create);

/** PUT /users/:id/roles */
router.put(
  '/:id/roles',
  authenticate,
  attachAbility,
  checkPermission('assign-roles', subject),
  validate({ params: usersValidation.idParam, body: usersValidation.assignRoles }),
  usersController.assignRoles
);

/** POST /users/:id/restore */
router.post('/:id/restore', authenticate, attachAbility, checkPermission('restore', subject), validate({ params: usersValidation.idParam }), usersController.restore);

/** GET /users/:id */
router.get('/:id', authenticate, attachAbility, checkPermission('read', subject), validate({ params: usersValidation.idParam }), usersController.getById);

/** PUT /users/:id */
router.put('/:id', authenticate, attachAbility, checkPermission('update', subject), validate({ params: usersValidation.idParam, body: usersValidation.update }), usersController.update);

/** DELETE /users/:id */
router.delete('/:id', authenticate, attachAbility, checkPermission('delete', subject), validate({ params: usersValidation.idParam }), usersController.remove);

module.exports = router;

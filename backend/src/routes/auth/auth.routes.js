'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const attachAbility = require('../../middleware/attachAbility');
const checkPermission = require('../../middleware/checkPermission');
const validate = require('../../middleware/validate');
const authValidation = require('../../validations/auth/auth.validation');
const authController = require('../../controllers/auth/auth.controller');

/** POST /auth/login */
router.post('/login', validate({ body: authValidation.login }), authController.login);

/** POST /auth/register */
router.post(
  '/register',
  authenticate,
  attachAbility,
  checkPermission('create', 'User'),
  validate({ body: authValidation.register }),
  authController.register
);

/** GET /auth/me */
router.get('/me', authenticate, authController.me);

/** GET /auth/profile */
router.get('/profile', authenticate, authController.profile);

/** PUT /auth/profile */
router.put(
  '/profile',
  authenticate,
  validate({ body: authValidation.updateProfile }),
  authController.updateProfile
);

/** PUT /auth/change-password */
router.put(
  '/change-password',
  authenticate,
  validate({ body: authValidation.changePassword }),
  authController.changePassword
);

/** POST /auth/refresh */
router.post('/refresh', authenticate, authController.refresh);

/** POST /auth/logout */
router.post('/logout', authenticate, authController.logout);

module.exports = router;

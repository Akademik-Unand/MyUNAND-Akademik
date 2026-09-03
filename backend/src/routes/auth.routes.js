'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authenticate, authController.register);
router.get('/profile', authenticate, authController.profile);
router.post('/refresh', authenticate, authController.refresh);
router.post('/logout', authenticate, authController.logout);

module.exports = router;

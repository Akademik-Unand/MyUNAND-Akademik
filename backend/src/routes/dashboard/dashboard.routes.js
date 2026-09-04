'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const dashboardController = require('../../controllers/dashboard/dashboard.controller');

/** GET /dashboard/summary */
router.get('/summary', authenticate, dashboardController.summary);

module.exports = router;

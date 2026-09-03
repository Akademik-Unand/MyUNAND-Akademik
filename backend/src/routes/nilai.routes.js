'use strict';
const express = require('express');
const router = express.Router();
const nilaiController = require('../controllers/nilai.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', nilaiController.getAll);
router.post('/', nilaiController.create);
router.post('/upload', nilaiController.uploadNilaiBulk);
router.get('/:id', nilaiController.getById);
router.put('/:id', nilaiController.update);
router.delete('/:id', nilaiController.delete);

module.exports = router;

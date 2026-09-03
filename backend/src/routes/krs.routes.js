'use strict';
const express = require('express');
const router = express.Router();
const krsController = require('../controllers/krs.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', krsController.getAll);
router.post('/', krsController.create);
router.get('/:id', krsController.getById);
router.put('/:id', krsController.update);
router.delete('/:id', krsController.delete);

// Custom KRS workflows
router.patch('/:id/approve', krsController.approveKrs);
router.patch('/detil/:detilId/status', krsController.updateDetilStatus);
router.get('/mahasiswa/:mahasiswaId', krsController.getKrsByMahasiswa);

module.exports = router;

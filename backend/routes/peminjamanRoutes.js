const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjamanController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, peminjamanController.createPeminjaman);
router.get('/', verifyToken, peminjamanController.getAllPeminjaman);
router.get('/:id', verifyToken, peminjamanController.getPeminjamanById);
router.put('/:id/kembalikan', verifyToken, peminjamanController.kembalikanBarang);

module.exports = router;
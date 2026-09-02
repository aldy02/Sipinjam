const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjamanController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', verifyToken, peminjamanController.createPeminjaman);
router.get('/', verifyToken, peminjamanController.getAllPeminjaman);
router.get('/:id', verifyToken, peminjamanController.getPeminjamanById);
router.put(
  '/:id/kembalikan',
  verifyToken,
  upload.single('foto_bukti_kembali'),
  peminjamanController.kembalikanBarang
);

module.exports = router;
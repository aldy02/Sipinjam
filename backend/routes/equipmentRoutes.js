const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Semua user yang login bisa lihat daftar barang
router.get('/', verifyToken, equipmentController.getAllEquipment);
router.get('/:id', verifyToken, equipmentController.getEquipmentById);

// Hanya admin yang bisa tambah/update/hapus barang
router.post('/', verifyToken, checkRole('admin'), equipmentController.createEquipment);
router.put('/:id', verifyToken, checkRole('admin'), equipmentController.updateEquipment);
router.delete('/:id', verifyToken, checkRole('admin'), equipmentController.deleteEquipment);

module.exports = router;
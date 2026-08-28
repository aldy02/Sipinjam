const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', verifyToken, checkRole('admin'), userController.getAllUsers);
router.get('/:id', verifyToken, checkRole('admin'), userController.getUserById);
router.post('/', verifyToken, checkRole('admin'), userController.createUser);
router.put('/:id', verifyToken, checkRole('admin'), userController.updateUser);
router.put('/:id/reset-password', verifyToken, checkRole('admin'), userController.resetUserPassword);
router.delete('/:id', verifyToken, checkRole('admin'), userController.deleteUser);

module.exports = router;
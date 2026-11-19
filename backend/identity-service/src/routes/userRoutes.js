// Đường dẫn gốc: /api/users - toàn bộ chỉ dành cho Admin
const express = require('express');
const userController = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const { requireRole } = require('../middlewares/authMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();
router.use(requireRole(ROLES.ADMIN));

router.get('/', asyncHandler(userController.listUsers));
router.get('/stats', asyncHandler(userController.getUserStatistics));
router.patch('/:id/status', asyncHandler(userController.updateUserStatus));
router.put('/:id/roles', asyncHandler(userController.updateUserRoles));

module.exports = router;

// Đường dẫn gốc: /api/auth
const express = require('express');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

// public
router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/logout', asyncHandler(authController.logout));

// need login 
router.get('/me', requireAuth, asyncHandler(authController.getMyProfile));
router.put('/me', requireAuth, asyncHandler(authController.updateMyProfile));
router.put('/change-password', requireAuth, asyncHandler(authController.changePassword));
// login by Google 
// Thêm dòng này vào nhóm route công khai
router.post('/google', asyncHandler(authController.googleLogin));
module.exports = router;

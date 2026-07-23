const express = require('express');
const router = express.Router();
const { login, googleLogin, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { verifyAdminToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, login);
router.post('/google', loginLimiter, googleLogin);
router.get('/me', verifyAdminToken, getMe);
router.put('/profile', verifyAdminToken, updateProfile);
router.put('/change-password', verifyAdminToken, changePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { verifyAdminToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login', loginLimiter, login);
router.get('/me', verifyAdminToken, getMe);

module.exports = router;

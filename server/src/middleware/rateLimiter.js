const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/responseHandler');

// Rate limiter for admin login (max 5 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    return errorResponse(res, 'Terlalu banyak percoban login. Silakan coba lagi setelah 15 menit.', null, 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for contact form submissions (max 5 messages per hour per IP)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    return errorResponse(res, 'Anda telah mengirim pesan terlalu sering. Silakan coba lagi dalam 1 jam.', null, 429);
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  contactLimiter
};

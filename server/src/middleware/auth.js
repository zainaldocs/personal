const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');

const verifyAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak. Token otentikasi tidak ditemukan.', null, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_teguh_pratama_jwt_key_2026_secure');
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Sesi login telah berakhir, silakan login kembali.', null, 401);
    }
    return errorResponse(res, 'Token otentikasi tidak valid.', null, 403);
  }
};

module.exports = {
  verifyAdminToken
};

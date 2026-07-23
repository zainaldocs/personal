const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email dan password wajib diisi.', null, 400);
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return errorResponse(res, 'Email atau password salah.', null, 401);
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Email atau password salah.', null, 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'super_secret_teguh_pratama_jwt_key_2026_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return successResponse(res, 'Login berhasil.', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return errorResponse(res, 'User tidak ditemukan.', null, 404);
    }

    return successResponse(res, 'Data user berhasil diambil.', users[0]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const logActivity = async (userId, action, ipAddress, userAgent, status) => {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, ip_address, user_agent, status) VALUES (?, ?, ?, ?, ?)',
      [userId || null, action, ipAddress || '127.0.0.1', userAgent || '', status]
    );
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

const login = async (req, res, next) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      await logActivity(null, `LOGIN_ATTEMPT: ${email || 'Empty'}`, ipAddress, userAgent, 'FAILED');
      return errorResponse(res, 'Email dan password wajib diisi.', null, 400);
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      await logActivity(null, `LOGIN_FAILED: ${email}`, ipAddress, userAgent, 'FAILED');
      return errorResponse(res, 'Email atau password salah.', null, 401);
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      await logActivity(user.id, `LOGIN_FAILED: ${email}`, ipAddress, userAgent, 'FAILED');
      return errorResponse(res, 'Email atau password salah.', null, 401);
    }

    await logActivity(user.id, `LOGIN_SUCCESS: ${user.email}`, ipAddress, userAgent, 'SUCCESS');

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

const googleLogin = async (req, res, next) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';

  try {
    const { credential, access_token } = req.body;
    let email = null;
    let name = null;

    if (access_token) {
      // Fetch user profile from Google API using access_token
      const fetchRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
      const googleUser = await fetchRes.json();
      email = googleUser.email;
      name = googleUser.name;
    } else if (credential) {
      let payload;
      try {
        if (process.env.GOOGLE_CLIENT_ID) {
          const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
          });
          payload = ticket.getPayload();
        } else {
          const base64Url = credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
          payload = JSON.parse(jsonPayload);
        }
      } catch (err) {
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        payload = JSON.parse(jsonPayload);
      }
      email = payload.email;
      name = payload.name;
    }

    if (!email) {
      await logActivity(null, 'GOOGLE_LOGIN_FAILED: No Email', ipAddress, userAgent, 'FAILED');
      return errorResponse(res, 'Gagal mengambil data email dari Google.', null, 400);
    }

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      await logActivity(null, `GOOGLE_LOGIN_UNAUTHORIZED: ${email}`, ipAddress, userAgent, 'FAILED');
      return errorResponse(res, `Akun Google (${email}) tidak terdaftar sebagai administrator.`, null, 403);
    }

    const user = users[0];
    await logActivity(user.id, `GOOGLE_LOGIN_SUCCESS: ${user.email}`, ipAddress, userAgent, 'SUCCESS');

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'super_secret_teguh_pratama_jwt_key_2026_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return successResponse(res, 'Login via Google berhasil.', {
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

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return errorResponse(res, 'Nama dan email wajib diisi.', null, 400);
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existing.length > 0) {
      return errorResponse(res, 'Email sudah digunakan oleh akun lain.', null, 400);
    }

    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    await logActivity(userId, `UPDATE_PROFILE: ${email}`, ipAddress, userAgent, 'SUCCESS');

    const token = jwt.sign(
      { id: userId, email, name },
      process.env.JWT_SECRET || 'super_secret_teguh_pratama_jwt_key_2026_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return successResponse(res, 'Profil berhasil diperbarui.', {
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Password saat ini dan password baru wajib diisi.', null, 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password baru minimal harus 6 karakter.', null, 400);
    }

    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return errorResponse(res, 'User tidak ditemukan.', null, 404);
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      await logActivity(userId, 'CHANGE_PASSWORD_FAILED: Invalid Current Password', ipAddress, userAgent, 'FAILED');
      return errorResponse(res, 'Password saat ini tidak sesuai.', null, 400);
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHashedPassword, userId]);

    await logActivity(userId, 'CHANGE_PASSWORD_SUCCESS', ipAddress, userAgent, 'SUCCESS');

    return successResponse(res, 'Kata sandi berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const [logs] = await pool.query(`
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    return successResponse(res, 'Audit logs berhasil diambil.', logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  getAuditLogs
};

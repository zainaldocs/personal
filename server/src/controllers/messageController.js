const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const sanitizeHtml = require('sanitize-html');

const createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return errorResponse(res, 'Nama, email, dan pesan wajib diisi.', null, 400);
    }

    const cleanName = sanitizeHtml(name);
    const cleanEmail = sanitizeHtml(email);
    const cleanSubject = subject ? sanitizeHtml(subject) : 'Pertanyaan Umum';
    const cleanMessage = sanitizeHtml(message);

    const [result] = await pool.query(
      'INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [cleanName, cleanEmail, cleanSubject, cleanMessage]
    );

    return successResponse(res, 'Pesan Anda berhasil terkirim. Terima kasih telah menghubungi!', { id: result.insertId }, 201);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const [messages] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    return successResponse(res, 'Daftar pesan berhasil diambil.', messages);
  } catch (error) {
    next(error);
  }
};

const markMessageAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('UPDATE messages SET is_read = 1 WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Pesan tidak ditemukan.', null, 404);
    }

    return successResponse(res, 'Pesan ditandai sebagai sudah dibaca.');
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Pesan tidak ditemukan.', null, 404);
    }

    return successResponse(res, 'Pesan berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage
};

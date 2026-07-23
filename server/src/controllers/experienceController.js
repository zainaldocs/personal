const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getExperiences = async (req, res, next) => {
  try {
    const [experiences] = await pool.query('SELECT * FROM experiences ORDER BY sort_order ASC, id DESC');
    return successResponse(res, 'Daftar pengalaman berhasil diambil.', experiences);
  } catch (error) {
    next(error);
  }
};

const createExperience = async (req, res, next) => {
  try {
    const { role_id, role_en, company, period, description_id, description_en, sort_order } = req.body;

    if (!role_id || !role_en || !company || !period) {
      return errorResponse(res, 'Peran (ID/EN), perusahaan, dan periode wajib diisi.', null, 400);
    }

    const [result] = await pool.query(
      `INSERT INTO experiences (role_id, role_en, company, period, description_id, description_en, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [role_id, role_en, company, period, description_id || '', description_en || '', sort_order || 0]
    );

    return successResponse(res, 'Pengalaman berhasil ditambahkan.', { id: result.insertId }, 201);
  } catch (error) {
    next(error);
  }
};

const updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role_id, role_en, company, period, description_id, description_en, sort_order } = req.body;

    const [existing] = await pool.query('SELECT * FROM experiences WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Pengalaman tidak ditemukan.', null, 404);
    }

    await pool.query(
      `UPDATE experiences 
       SET role_id = ?, role_en = ?, company = ?, period = ?, description_id = ?, description_en = ?, sort_order = ?
       WHERE id = ?`,
      [
        role_id || existing[0].role_id,
        role_en || existing[0].role_en,
        company || existing[0].company,
        period || existing[0].period,
        description_id !== undefined ? description_id : existing[0].description_id,
        description_en !== undefined ? description_en : existing[0].description_en,
        sort_order !== undefined ? sort_order : existing[0].sort_order,
        id
      ]
    );

    return successResponse(res, 'Pengalaman berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
};

const deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM experiences WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Pengalaman tidak ditemukan.', null, 404);
    }

    return successResponse(res, 'Pengalaman berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience
};

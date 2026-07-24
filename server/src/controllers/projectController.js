const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { generateSlug } = require('../utils/slugHelper');

const getProjects = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const page = req.query.page ? Math.max(1, parseInt(req.query.page, 10)) : null;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit, 10))) : null;

    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (featured === 'true' || featured === '1') {
      query += ' AND is_featured = 1';
    }

    query += ' ORDER BY sort_order ASC, created_at DESC';

    if (page && limit) {
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [projects] = await pool.query(query, params);

    const parsedProjects = projects.map(p => ({
      ...p,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags
    }));

    return successResponse(res, 'Daftar proyek berhasil diambil.', parsedProjects);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { title, description_id, description_en, category, tags, project_url, github_url, is_featured, sort_order } = req.body;

    if (!title || !description_id || !category) {
      return errorResponse(res, 'Judul, deskripsi, dan kategori wajib diisi.', null, 400);
    }

    const slug = generateSlug(title) + '-' + Date.now().toString().slice(-4);
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : [tags || 'Tech']);
    const resolvedDescEn = description_en || description_id;

    const [result] = await pool.query(
      `INSERT INTO projects (slug, title, description_id, description_en, category, tags, project_url, github_url, is_featured, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        title,
        description_id,
        resolvedDescEn,
        category,
        tagsJson,
        project_url || '',
        github_url || '',
        is_featured ? 1 : 0,
        sort_order || 0
      ]
    );

    return successResponse(res, 'Proyek berhasil dibuat.', { id: result.insertId, slug }, 201);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description_id, description_en, category, tags, project_url, github_url, is_featured, sort_order } = req.body;

    const [existing] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Proyek tidak ditemukan.', null, 404);
    }

    const tagsJson = tags ? JSON.stringify(Array.isArray(tags) ? tags : [tags]) : existing[0].tags;

    await pool.query(
      `UPDATE projects 
       SET title = ?, description_id = ?, description_en = ?, category = ?, tags = ?, project_url = ?, github_url = ?, is_featured = ?, sort_order = ?
       WHERE id = ?`,
      [
        title !== undefined ? title : existing[0].title,
        description_id !== undefined ? description_id : existing[0].description_id,
        description_en !== undefined ? description_en : existing[0].description_en,
        category !== undefined ? category : existing[0].category,
        tagsJson,
        project_url !== undefined ? project_url : existing[0].project_url,
        github_url !== undefined ? github_url : existing[0].github_url,
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing[0].is_featured,
        sort_order !== undefined ? sort_order : existing[0].sort_order,
        id
      ]
    );

    return successResponse(res, 'Proyek berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Proyek tidak ditemukan.', null, 404);
    }

    return successResponse(res, 'Proyek berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};

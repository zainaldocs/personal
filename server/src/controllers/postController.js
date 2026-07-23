const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { generateSlug } = require('../utils/slugHelper');
const sanitizeHtml = require('sanitize-html');

const getPosts = async (req, res, next) => {
  try {
    const { q, category, is_published } = req.query;
    let query = 'SELECT id, slug, title_id, title_en, excerpt_id, excerpt_en, category, read_time, is_published, published_at, created_at FROM posts WHERE 1=1';
    const params = [];

    if (is_published !== undefined) {
      query += ' AND is_published = ?';
      params.push(is_published === 'true' || is_published === '1' ? 1 : 0);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (q) {
      query += ' AND (title_id LIKE ? OR title_en LIKE ? OR excerpt_id LIKE ? OR excerpt_en LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY published_at DESC';

    const [posts] = await pool.query(query, params);
    return successResponse(res, 'Daftar artikel berhasil diambil.', posts);
  } catch (error) {
    next(error);
  }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const [posts] = await pool.query(
      'SELECT id, slug, title_id, title_en, content_id, content_en, excerpt_id, excerpt_en, category, read_time, is_published, published_at, created_at FROM posts WHERE slug = ?',
      [slug]
    );

    if (posts.length === 0) {
      return errorResponse(res, 'Artikel tidak ditemukan.', null, 404);
    }

    return successResponse(res, 'Detail artikel berhasil diambil.', posts[0]);
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title_id, title_en, content_id, content_en, excerpt_id, excerpt_en, category, read_time, is_published } = req.body;

    if (!title_id || !title_en || !content_id || !content_en || !category) {
      return errorResponse(res, 'Judul, konten (ID/EN), dan kategori wajib diisi.', null, 400);
    }

    const slug = generateSlug(title_en || title_id) + '-' + Date.now().toString().slice(-4);
    
    // Sanitize HTML Content
    const cleanContentId = sanitizeHtml(content_id);
    const cleanContentEn = sanitizeHtml(content_en);

    const [result] = await pool.query(
      `INSERT INTO posts (slug, title_id, title_en, content_id, content_en, excerpt_id, excerpt_en, category, read_time, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        title_id,
        title_en,
        cleanContentId,
        cleanContentEn,
        excerpt_id || '',
        excerpt_en || '',
        category,
        read_time || '5 min baca',
        is_published !== undefined ? (is_published ? 1 : 0) : 1
      ]
    );

    return successResponse(res, 'Artikel berhasil dibuat.', { id: result.insertId, slug }, 201);
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title_id, title_en, content_id, content_en, excerpt_id, excerpt_en, category, read_time, is_published } = req.body;

    const [existing] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Artikel tidak ditemukan.', null, 404);
    }

    const cleanContentId = content_id ? sanitizeHtml(content_id) : existing[0].content_id;
    const cleanContentEn = content_en ? sanitizeHtml(content_en) : existing[0].content_en;

    await pool.query(
      `UPDATE posts 
       SET title_id = ?, title_en = ?, content_id = ?, content_en = ?, excerpt_id = ?, excerpt_en = ?, category = ?, read_time = ?, is_published = ?
       WHERE id = ?`,
      [
        title_id || existing[0].title_id,
        title_en || existing[0].title_en,
        cleanContentId,
        cleanContentEn,
        excerpt_id !== undefined ? excerpt_id : existing[0].excerpt_id,
        excerpt_en !== undefined ? excerpt_en : existing[0].excerpt_en,
        category || existing[0].category,
        read_time || existing[0].read_time,
        is_published !== undefined ? (is_published ? 1 : 0) : existing[0].is_published,
        id
      ]
    );

    return successResponse(res, 'Artikel berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Artikel tidak ditemukan.', null, 404);
    }

    return successResponse(res, 'Artikel berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
};

const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, value_id, value_en FROM site_settings');
    const settingsMap = {};
    rows.forEach(row => {
      settingsMap[row.setting_key] = {
        id: row.value_id,
        en: row.value_en
      };
    });

    return successResponse(res, 'Pengaturan situs berhasil diambil.', settingsMap);
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body; // Array of { key, id, en } or Object
    if (!settings) {
      return errorResponse(res, 'Data settings wajib diberikan.', null, 400);
    }

    const items = Array.isArray(settings) ? settings : Object.keys(settings).map(k => ({
      key: k,
      id: settings[k].id,
      en: settings[k].en
    }));

    for (const item of items) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, value_id, value_en)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value_id = VALUES(value_id), value_en = VALUES(value_en)`,
        [item.key, item.id || '', item.en || '']
      );
    }

    return successResponse(res, 'Pengaturan situs berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};

const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { sendTestEmail } = require('../utils/mailer');
const { encrypt } = require('../utils/cryptoHelper');

const PRIVATE_SETTING_KEYS = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'notification_email'];

const ALLOWED_SETTING_KEYS = [
  'site_title',
  'site_owner_name',
  'hero_status',
  'hero_title',
  'hero_desc',
  'contact_email',
  'social_github',
  'social_twitter',
  'social_linkedin',
  'smtp_host',
  'smtp_port',
  'smtp_user',
  'smtp_pass',
  'notification_email'
];

const getSettings = async (req, res, next) => {
  try {
    const isAdmin = Boolean(req.user);
    const [rows] = await pool.query('SELECT setting_key, value_id, value_en FROM site_settings');
    const settingsMap = {};

    rows.forEach(row => {
      // Hide sensitive SMTP keys from unauthenticated public visitors
      if (!isAdmin && PRIVATE_SETTING_KEYS.includes(row.setting_key)) {
        return;
      }

      // Do not return encrypted smtp_pass to frontend for safety
      if (row.setting_key === 'smtp_pass' && !isAdmin) {
        return;
      }

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
    const { settings } = req.body;
    if (!settings) {
      return errorResponse(res, 'Data settings wajib diberikan.', null, 400);
    }

    const items = Array.isArray(settings) ? settings : Object.keys(settings).map(k => ({
      key: k,
      id: settings[k].id,
      en: settings[k].en
    }));

    for (const item of items) {
      // Whitelist check
      if (!ALLOWED_SETTING_KEYS.includes(item.key)) {
        continue; // Skip unrecognized/unallowed keys for security
      }

      let valId = item.id || '';
      let valEn = item.en || '';

      // Encrypt sensitive SMTP password before saving to DB
      if (item.key === 'smtp_pass' && valId) {
        valId = encrypt(valId);
        valEn = valId;
      }

      await pool.query(
        `INSERT INTO site_settings (setting_key, value_id, value_en)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value_id = VALUES(value_id), value_en = VALUES(value_en)`,
        [item.key, valId, valEn]
      );
    }

    return successResponse(res, 'Pengaturan situs berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
};

const testSmtp = async (req, res, next) => {
  try {
    await sendTestEmail();
    return successResponse(res, 'Pesan tes email berhasil dikirim! Silakan periksa inbox email Anda.');
  } catch (error) {
    return errorResponse(res, error.message || 'Gagal mengirim email tes.', null, 400);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  testSmtp
};

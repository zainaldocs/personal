const nodemailer = require('nodemailer');
const { pool } = require('../config/db');
const { decrypt } = require('./cryptoHelper');

const getSmtpConfig = async () => {
  try {
    const [rows] = await pool.query('SELECT setting_key, value_id FROM site_settings WHERE setting_key LIKE "smtp_%" OR setting_key = "notification_email" OR setting_key = "site_title"');
    const config = {};
    rows.forEach(r => {
      config[r.setting_key] = r.value_id;
    });

    const host = config.smtp_host || process.env.SMTP_HOST;
    const port = config.smtp_port || process.env.SMTP_PORT || '587';
    const user = config.smtp_user || process.env.SMTP_USER;
    let pass = config.smtp_pass || process.env.SMTP_PASS;
    const notificationEmail = config.notification_email || process.env.NOTIFICATION_EMAIL || user || 'admin@personal.co';
    const siteTitle = config.site_title || 'Personal Web';

    if (pass) {
      pass = decrypt(pass);
    }

    if (host && user && pass) {
      return {
        transporter: nodemailer.createTransport({
          host,
          port: parseInt(port, 10),
          secure: parseInt(port, 10) === 465,
          auth: { user, pass }
        }),
        user,
        notificationEmail,
        siteTitle
      };
    }
  } catch (err) {
    console.error('Failed to load DB SMTP settings:', err.message);
  }

  // Fallback to env
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }),
      user: process.env.SMTP_USER,
      notificationEmail: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER || 'admin@personal.co',
      siteTitle: 'Personal Web'
    };
  }

  return null;
};

const sendNewMessageNotification = async ({ name, email, subject, message }) => {
  try {
    const config = await getSmtpConfig();

    if (!config || !config.transporter) {
      console.log(`[SMTP Not Configured] Notification logged for new message from ${name} (${email}): "${subject}"`);
      return false;
    }

    const mailOptions = {
      from: `"${config.siteTitle} Contact" <${config.user}>`,
      to: config.notificationEmail,
      subject: `[Pesan Baru] ${subject || 'Kontak dari ' + name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #111; margin-top: 0;">📬 Pesan Baru dari Website ${config.siteTitle}</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
          <p><strong>Pengirim:</strong> ${name} (&lt;<a href="mailto:${email}">${email}</a>&gt;)</p>
          <p><strong>Subjek:</strong> ${subject || 'Tanpa Subjek'}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; white-space: pre-wrap;">${message}</div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
          <p style="font-size: 12px; color: #888;">Pesan ini dikirim secara otomatis dari formulir kontak website ${config.siteTitle}.</p>
        </div>
      `
    };

    await config.transporter.sendMail(mailOptions);
    console.log(`[SMTP Success] Email notification sent to ${config.notificationEmail}`);
    return true;
  } catch (err) {
    console.error('[SMTP Error] Failed to send email notification:', err.message);
    return false;
  }
};

const sendTestEmail = async () => {
  const config = await getSmtpConfig();
  if (!config || !config.transporter) {
    throw new Error('SMTP belum dikonfigurasi. Harap isi SMTP Host, User, dan Password.');
  }

  const mailOptions = {
    from: `"${config.siteTitle} Test" <${config.user}>`,
    to: config.notificationEmail,
    subject: `[Tes Koneksi SMTP] ${config.siteTitle} Admin CMS`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #10b981; border-radius: 12px;">
        <h2 style="color: #10b981; margin-top: 0;">✅ Koneksi SMTP Berhasil!</h2>
        <p>Email ini adalah pesan pengujian otomatis dari Panel Admin CMS ${config.siteTitle}.</p>
        <p>Pengaturan SMTP Anda telah terkonfigurasi dengan benar dan siap menerima notifikasi pesan masuk.</p>
      </div>
    `
  };

  await config.transporter.sendMail(mailOptions);
  return true;
};

module.exports = {
  sendNewMessageNotification,
  sendTestEmail
};

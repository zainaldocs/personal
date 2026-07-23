const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const getEncryptionKey = () => {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY || process.env.JWT_SECRET || 'personal_portfolio_default_encryption_key_2026';
  return crypto.createHash('sha256').update(secret).digest();
};

const encrypt = (text) => {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (text) => {
  if (!text) return '';
  if (!text.includes(':')) return text; // Fallback for plain unencrypted text
  try {
    const [ivHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', getEncryptionKey(), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return text;
  }
};

module.exports = {
  encrypt,
  decrypt
};

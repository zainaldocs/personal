const dotenv = require('dotenv');
dotenv.config();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
    }
    return 'personal_portfolio_jwt_secret_dev_key_2026';
  }
  return secret;
};

module.exports = {
  getJwtSecret
};

const dotenv = require('dotenv');
dotenv.config();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing!');
  }
  return secret;
};

module.exports = {
  getJwtSecret
};

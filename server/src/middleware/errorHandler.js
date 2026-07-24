const { errorResponse } = require('../utils/responseHandler');

const globalErrorHandler = (err, req, res, next) => {
  console.error('💥 Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  
  // Prevent leaking internal error messages in production for 500 errors
  let message = err.message || 'Terjadi kesalahan internal pada server.';
  if (statusCode === 500 && process.env.NODE_ENV !== 'development') {
    message = 'Terjadi kesalahan internal pada server.';
  }

  return errorResponse(res, message, process.env.NODE_ENV === 'development' ? err.stack : null, statusCode);
};

module.exports = {
  globalErrorHandler
};

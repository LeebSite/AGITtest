/**
 * Middleware penanganan error terpusat
 */
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  const response = {
    success: false,
    error: isClientError ? err.message : 'Terjadi kesalahan internal pada server',
  };

  if (process.env.NODE_ENV === 'development' && !isClientError) {
    response.details = err.message;
  }

  res.status(statusCode).json(response);
}

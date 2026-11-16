/**
 * Central Error Handling Middleware
 * Provides uniform JSON responses and detailed developer diagnostics.
 */

// 404 Not Found Handler for unmatched routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    suggestion: 'Please verify the route URL. Available root endpoints start with /api',
  });
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
  console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle CORS errors
  if (err.message && err.message.startsWith('CORS Error:')) {
    statusCode = 403;
    message = 'Cross-Origin Request Blocked: The frontend origin is not permitted by CORS policy.';
  }

  // Handle Mongoose Validation Errors (e.g. required fields missing)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error: Please check your input fields.';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose Duplicate Key Error (e.g. duplicate studentId or email)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : '';
    message = `Duplicate Entry: A student with this ${duplicateField} ("${duplicateValue}") already exists.`;
  }

  // Handle Mongoose CastError (e.g. invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format: "${err.value}" is not a valid resource identifier.`;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { notFoundHandler, errorHandler };

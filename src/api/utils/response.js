// src/api/utils/response.js - Response Helper Functions

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, error, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    error: error.message || 'An error occurred'
  });
};

const paginatedResponse = (res, data, pagination) => {
  return res.json({
    success: true,
    data,
    pagination
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
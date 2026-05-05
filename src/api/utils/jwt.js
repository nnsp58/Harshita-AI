// src/api/utils/jwt.js - JWT Utility Functions

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const createToken = (payload, options = {}) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

const createAccessToken = (userId) => {
  return createToken({ userId });
};

const createRefreshToken = (userId) => {
  return createToken({ userId, type: 'refresh' }, { expiresIn: '7d' });
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  createToken,
  verifyToken,
  decodeToken,
  createAccessToken,
  createRefreshToken,
  isTokenExpired
};
// src/api/controllers/authController.js - Authentication Controller

const bcrypt = require('bcrypt');
const { prisma } = require('../../models/database');
const { generateToken, generateRefreshToken, JWT_SECRET } = require('../middleware/auth');
const { ApiError } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema } = require('../validations/schemas');

const inMemoryUsers = new Map();
const inMemoryTokens = new Map();

function getInMemoryUsers() {
  return inMemoryUsers;
}

function getInMemoryTokens() {
  return inMemoryTokens;
}

let dbConnected = false;

async function getPrisma() {
  if (prisma && dbConnected) return prisma;
  if (prisma) {
    try {
      await prisma.$connect();
      dbConnected = true;
      return prisma;
    } catch (e) {
      dbConnected = false;
    }
  }
  return null;
}

async function findUser(email) {
  const db = await getPrisma();
  const dbUser = db ? await db.user.findUnique({ where: { email } }) : null;
  return dbUser || inMemoryUsers.get(email) || null;
}

async function createUser(data) {
  const db = await getPrisma();
  if (db) {
    return db.user.create({ data });
  }
  const user = { id: Date.now().toString(), ...data, is_active: true, created_at: new Date() };
  inMemoryUsers.set(data.email, user);
  return user;
}

async function ensureDefaultCsc(db, userData) {
  return db.cSC.upsert({
    where: { id: 'default-csc' },
    update: {},
    create: {
      id: 'default-csc',
      name: `${userData.name || 'Default'} CSC`,
      address: 'Default CSC Address',
      contact_email: userData.email,
      contact_phone: '0000000000',
      plan: 'free',
      is_active: true
    }
  });
}

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await findUser(data.email);

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const db = await getPrisma();
    const csc = db ? await ensureDefaultCsc(db, data) : null;

    const user = await createUser({
      email: data.email,
      password_hash: passwordHash,
      name: data.name,
      role: data.role || 'operator',
      is_active: true,
      ...(csc && { csc_id: csc.id })
    });

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    if (db) {
      await db.refreshToken.create({
        data: {
          token: refreshToken,
          user_id: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    } else {
      inMemoryTokens.set(refreshToken, { user_id: user.id, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    }

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await findUser(data.email);

    if (!user || !user.is_active) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);

    if (!isValidPassword) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const db = await getPrisma();
    if (db) {
      await db.refreshToken.create({
        data: {
          token: refreshToken,
          user_id: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    } else {
      inMemoryTokens.set(refreshToken, { user_id: user.id, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    }

    // Include CSC info in response
    let cscInfo = null;
    if (user.csc_id && db) {
      cscInfo = await db.cSC.findUnique({
        where: { id: user.csc_id },
        select: { id: true, name: true, plan: true, expires_at: true }
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          csc_id: user.csc_id
        },
        csc: cscInfo,
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token required');
    }

    const db = await getPrisma();
    if (!db) {
      const stored = inMemoryTokens.get(refreshToken);
      if (!stored || stored.expires_at < new Date()) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
      }

      const newToken = generateToken(stored.user_id);
      const newRefreshToken = generateRefreshToken(stored.user_id);
      inMemoryTokens.delete(refreshToken);
      inMemoryTokens.set(newRefreshToken, {
        user_id: stored.user_id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      return res.json({
        success: true,
        data: { token: newToken, refreshToken: newRefreshToken }
      });
    }

    const storedToken = await db.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken || storedToken.expires_at < new Date()) {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await db.user.findUnique({ where: { id: storedToken.user_id } });
    if (!user || !user.is_active) {
      throw ApiError.unauthorized('User account is inactive');
    }

    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await db.refreshToken.delete({
      where: { id: storedToken.id }
    });

    await db.refreshToken.create({
      data: {
        token: newRefreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      // TODO: Send email with reset link
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    res.json({
      success: true,
      message: 'If the email exists, a reset link will be sent'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type !== 'password_reset') {
      throw ApiError.badRequest('Invalid token');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password_hash: passwordHash }
    });

    await prisma.refreshToken.deleteMany({
      where: { user_id: decoded.userId }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(ApiError.badRequest('Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  inMemoryUsers,
  getInMemoryUsers,
  getInMemoryTokens
};

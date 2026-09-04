'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sequelize, User, RefreshToken } = require('../../models');
const jwtConfig = require('../../config/jwt');
const AppError = require('../../helpers/AppError');
const logger = require('../../utils/logger');
const { expiresAtFrom } = require('../../helpers/jwtExpiry');
const { hashRefreshToken, createRefreshTokenValue } = require('../../helpers/refreshToken');
const { findUserWithAccess, getUserAccessById, toAccessPayload } = require('../../helpers/userAccess');

const REFRESH_FALLBACK_MS = 7 * 24 * 60 * 60 * 1000;

const generateAccessToken = (user, roles = []) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: roles[0]?.name || user.role,
      roles: roles.map((role) => role.name),
      name: user.name,
      dosen_id: user.dosen_id,
      mahasiswa_id: user.mahasiswa_id,
      typ: 'access',
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

const persistRefreshToken = async (userId, transaction) => {
  const raw = createRefreshTokenValue();
  await RefreshToken.create(
    {
      user_id: userId,
      token_hash: hashRefreshToken(raw),
      expires_at: expiresAtFrom(jwtConfig.refreshExpiresIn, REFRESH_FALLBACK_MS),
    },
    { transaction }
  );
  return raw;
};

const issueSession = async (user, { transaction } = {}) => {
  const payload = toAccessPayload(user);
  const refreshToken = await persistRefreshToken(user.id, transaction);
  return {
    access_token: generateAccessToken(user, payload.roles),
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: jwtConfig.expiresIn,
    refresh_expires_in: jwtConfig.refreshExpiresIn,
    user: payload,
  };
};

const login = async ({ email, password }) => {
  const user = await findUserWithAccess({ email });
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Email atau password salah', 401);
  }

  logger.info({ userId: user.id, email: user.email }, 'User login');
  return issueSession(user);
};

const register = async (payload) => {
  const existing = await User.findOne({ where: { email: payload.email } });
  if (existing) {
    throw new AppError('Validation failed', 422, [{ field: 'email', message: 'Email sudah terdaftar' }]);
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: await bcrypt.hash(payload.password, 10),
    role: payload.role || 'admin',
    dosen_id: payload.dosen_id || null,
    mahasiswa_id: payload.mahasiswa_id || null,
  });

  logger.info({ userId: user.id, email: user.email }, 'User registered');
  return toAccessPayload(await getUserAccessById(user.id));
};

const profile = async (userId) => toAccessPayload(await getUserAccessById(userId));

const updateProfile = async (userId, { name }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }
  await user.update({ name });
  logger.info({ userId }, 'User profile updated');
  return toAccessPayload(await getUserAccessById(userId));
};

const changePassword = async (userId, { current_password, new_password }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User tidak ditemukan', 404);
  }

  const isValid = await bcrypt.compare(current_password, user.password);
  if (!isValid) {
    throw new AppError('Password saat ini salah', 400);
  }

  await user.update({ password: await bcrypt.hash(new_password, 10) });
  logger.info({ userId }, 'User password changed');
  return { id: userId };
};

const me = async (userId) => toAccessPayload(await getUserAccessById(userId));

const refresh = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);
  return sequelize.transaction(async (transaction) => {
    const row = await RefreshToken.findOne({
      where: { token_hash: tokenHash },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!row || row.revoked_at || row.expires_at <= new Date()) {
      throw new AppError('Refresh token tidak valid atau sudah kadaluarsa', 401);
    }
    await row.update({ revoked_at: new Date() }, { transaction });
    const user = await getUserAccessById(row.user_id);
    return issueSession(user, { transaction });
  });
};

const logout = async (refreshToken) => {
  const tokenHash = hashRefreshToken(refreshToken);
  const now = new Date();
  await RefreshToken.update(
    { revoked_at: now },
    { where: { token_hash: tokenHash, revoked_at: null } }
  );
  return { ok: true };
};

module.exports = {
  login,
  register,
  profile,
  updateProfile,
  changePassword,
  me,
  refresh,
  logout,
};

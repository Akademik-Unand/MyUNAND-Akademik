'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../../models');
const jwtConfig = require('../../config/jwt');
const AppError = require('../../helpers/AppError');
const logger = require('../../utils/logger');
const { findUserWithAccess, getUserAccessById, toAccessPayload } = require('../../helpers/userAccess');

const generateToken = (user, roles = []) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: roles[0]?.name || user.role,
      roles: roles.map((role) => role.name),
      name: user.name,
      dosen_id: user.dosen_id,
      mahasiswa_id: user.mahasiswa_id,
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

const login = async ({ email, password }) => {
  const user = await findUserWithAccess({ email });
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new AppError('Email atau password salah', 401);
  }

  const payload = toAccessPayload(user);
  logger.info({ userId: user.id, email: user.email }, 'User login');

  return {
    access_token: generateToken(user, payload.roles),
    token_type: 'Bearer',
    expires_in: jwtConfig.expiresIn,
    user: payload,
  };
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

const me = async (userId) => toAccessPayload(await getUserAccessById(userId));

const refresh = async (userId) => {
  const user = await getUserAccessById(userId);
  const payload = toAccessPayload(user);
  return {
    access_token: generateToken(user, payload.roles),
    token_type: 'Bearer',
    expires_in: jwtConfig.expiresIn,
  };
};

module.exports = { login, register, profile, me, refresh };

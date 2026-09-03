'use strict';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Dosen, Mahasiswa, Role } = require('../models');
const { success, error, unauthorized, validationError } = require('../helpers/response');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      dosen_id: user.dosen_id,
      mahasiswa_id: user.mahasiswa_id,
    },
    process.env.JWT_SECRET || 'jwt_secret_myunand_kurikulum_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return validationError(res, { email: 'Email dan password wajib diisi' });
    }

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Dosen, as: 'dosen' },
        { model: Mahasiswa, as: 'mahasiswa' },
      ],
    });

    if (!user) {
      return unauthorized(res, 'Email atau password salah');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return unauthorized(res, 'Email atau password salah');
    }

    const token = generateToken(user);

    return success(res, {
      message: 'Login berhasil',
      data: {
        access_token: token,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '24h',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          dosen: user.dosen,
          mahasiswa: user.mahasiswa,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, dosen_id, mahasiswa_id } = req.body;

    if (!name || !email || !password) {
      return validationError(res, {
        fields: 'Name, email, dan password wajib diisi',
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return validationError(res, { email: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'admin',
      dosen_id: dosen_id || null,
      mahasiswa_id: mahasiswa_id || null,
    });

    return success(res, {
      code: 201,
      message: 'Registrasi user berhasil',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const profile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'remember_token'] },
      include: [
        { model: Dosen, as: 'dosen' },
        { model: Mahasiswa, as: 'mahasiswa' },
      ],
    });

    if (!user) {
      return unauthorized(res, 'User tidak ditemukan');
    }

    return success(res, {
      message: 'Profile user berhasil diambil',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return unauthorized(res, 'User tidak ditemukan');
    }
    const token = generateToken(user);
    return success(res, {
      message: 'Token berhasil diperbarui',
      data: {
        access_token: token,
        token_type: 'Bearer',
        expires_in: process.env.JWT_EXPIRES_IN || '24h',
      },
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  return success(res, {
    message: 'Logout berhasil',
  });
};

module.exports = { login, register, profile, refresh, logout };

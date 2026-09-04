'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const authService = require('../../services/auth/auth.service');

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  return success(res, { message: 'Login berhasil', data });
});

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  return success(res, { code: 201, message: 'Registrasi user berhasil', data });
});

const profile = asyncHandler(async (req, res) => {
  const data = await authService.profile(req.user.id);
  return success(res, { message: 'Profile user berhasil diambil', data });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await authService.updateProfile(req.user.id, req.body);
  return success(res, { message: 'Profil berhasil diperbarui', data });
});

const changePassword = asyncHandler(async (req, res) => {
  const data = await authService.changePassword(req.user.id, req.body);
  return success(res, { message: 'Kata sandi berhasil diubah', data });
});

const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.user.id);
  return success(res, { message: 'Token berhasil diperbarui', data });
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.me(req.user.id);
  return success(res, { message: 'Data user lengkap berhasil diambil', data });
});

const logout = asyncHandler(async (req, res) => {
  return success(res, { message: 'Logout berhasil' });
});

module.exports = { login, register, profile, updateProfile, changePassword, me, refresh, logout };

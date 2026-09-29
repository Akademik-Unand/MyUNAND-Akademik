'use strict';

const { User, Dosen, Mahasiswa } = require('../models');
const AppError = require('./AppError');

const linkUserAcademicProfile = async ({ userId, dosenId = null, mahasiswaId = null, transaction }) => {
  if (dosenId && mahasiswaId) {
    throw new AppError('Akun hanya dapat terhubung ke satu profil akademik', 422);
  }

  const Profile = dosenId ? Dosen : mahasiswaId ? Mahasiswa : null;
  const profileId = dosenId || mahasiswaId;
  if (profileId) {
    const profile = await Profile.findByPk(profileId, { transaction, lock: transaction?.LOCK?.UPDATE });
    if (!profile) {
      throw new AppError(dosenId ? 'Data dosen tidak ditemukan' : 'Data mahasiswa tidak ditemukan', 422);
    }
    if (profile.user_id && profile.user_id !== userId) {
      throw new AppError('Data akademik tersebut sudah terhubung ke akun lain', 409);
    }
  }

  await Promise.all([
    Dosen.update({ user_id: null }, { where: { user_id: userId }, transaction }),
    Mahasiswa.update({ user_id: null }, { where: { user_id: userId }, transaction }),
  ]);
  if (profileId) await Profile.update({ user_id: userId }, { where: { id: profileId }, transaction });
};

const getUserAcademicIdentity = async (userId, { transaction } = {}) => {
  if (!userId) return { dosen_id: null, mahasiswa_id: null };
  const user = await User.findByPk(userId, {
    attributes: ['id'],
    include: [
      { model: Dosen, as: 'dosen', attributes: ['id'] },
      { model: Mahasiswa, as: 'mahasiswa', attributes: ['id'] },
    ],
    transaction,
  });
  return {
    dosen_id: user?.dosen?.id || user?.dosen_id || null,
    mahasiswa_id: user?.mahasiswa?.id || user?.mahasiswa_id || null,
  };
};

module.exports = { getUserAcademicIdentity, linkUserAcademicProfile };

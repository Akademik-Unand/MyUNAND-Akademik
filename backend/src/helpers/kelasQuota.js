'use strict';

const { Op } = require('sequelize');
const { Kelas, KrsDetil, PenawaranMatakuliahDetil } = require('../models');
const AppError = require('./AppError');

const CROSS_ACTIVE_STATUSES = ['pending_pa', 'approved'];

/** Enforce student origin limits across every class in the offered course. */
const assertGlobalOriginQuota = async ({
  kelas,
  origin,
  transaction,
  detail: loadedDetail,
}) => {
  if (!kelas?.penawaran_matakuliah_id) return;
  const detail =
    loadedDetail ||
    (await PenawaranMatakuliahDetil.findByPk(kelas.penawaran_matakuliah_id, {
      transaction,
    }));
  if (!detail) return;

  const quota =
    origin === 'cross'
      ? detail.kuota_lintas_prodi
      : detail.jumlah_peserta_internal_max_default;
  if (quota == null) return;

  const classes = await Kelas.findAll({
    where: { penawaran_matakuliah_id: detail.id },
    attributes: ['id'],
    transaction,
  });
  const classIds = classes.map((row) => row.id);
  if (!classIds.length) return;

  const where = {
    kelas_id: { [Op.in]: classIds },
    is_cross_enrollment: origin === 'cross',
  };
  if (origin === 'cross') {
    where.cross_enrollment_status = { [Op.in]: CROSS_ACTIVE_STATUSES };
  }

  const occupied = await KrsDetil.count({ where, transaction });
  if (occupied >= Number(quota)) {
    throw new AppError(
      origin === 'cross'
        ? 'Kuota lintas prodi global mata kuliah sudah penuh'
        : 'Kuota internal global mata kuliah sudah penuh',
      409,
    );
  }
};

module.exports = { assertGlobalOriginQuota };

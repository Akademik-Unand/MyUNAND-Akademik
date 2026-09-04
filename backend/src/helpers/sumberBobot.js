'use strict';

const { Op } = require('sequelize');
const { Cpmk, SumberPenilaian } = require('../models');
const AppError = require('./AppError');

const MAX_MK_BOBOT = 100;

const leafIds = (rows) => {
  const parentIds = new Set(rows.map((row) => row.parent_cpmk_id).filter(Boolean));
  return rows.filter((row) => !parentIds.has(row.id)).map((row) => row.id);
};

const assertCpmkBolehPunyaSumber = async (cpmkId, transaction) => {
  const child = await Cpmk.findOne({
    where: { parent_cpmk_id: cpmkId },
    transaction,
  });
  if (child) {
    throw new AppError('Sumber penilaian hanya boleh pada CPMK atau Sub-CPMK yang tidak punya turunan', 422);
  }
};

const assertTotalBobotMk = async (cpmkId, { excludeSumberId, incomingBobot }, transaction) => {
  const cpmk = await Cpmk.findByPk(cpmkId, { transaction });
  if (!cpmk) {
    throw new AppError('CPMK tidak ditemukan', 404);
  }
  await assertCpmkBolehPunyaSumber(cpmkId, transaction);

  const siblings = await Cpmk.findAll({
    where: { matakuliah_id: cpmk.matakuliah_id },
    attributes: ['id', 'parent_cpmk_id'],
    transaction,
  });
  const ids = leafIds(siblings);
  const where = { cpmk_id: { [Op.in]: ids } };
  if (excludeSumberId) where.id = { [Op.ne]: excludeSumberId };
  const rows = await SumberPenilaian.findAll({ where, transaction });
  const total = rows.reduce((sum, row) => sum + Number(row.bobot || 0), 0) + Number(incomingBobot || 0);
  if (total > MAX_MK_BOBOT + 0.01) {
    throw new AppError('Total bobot sumber penilaian pada mata kuliah maksimal 100%', 422);
  }
};

module.exports = { MAX_MK_BOBOT, leafIds, assertTotalBobotMk, assertCpmkBolehPunyaSumber };

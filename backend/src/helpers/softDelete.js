'use strict';

const AppError = require('./AppError');

const restoreRecord = async (Model, id, label) => {
  const item = await Model.findByPk(id, { paranoid: false });
  if (!item) {
    throw new AppError(`${label} dengan ID tersebut tidak ditemukan`, 404);
  }
  if (!item.deletedAt) {
    throw new AppError(`${label} tidak dalam arsip`, 400);
  }
  await item.restore();
  return Model.findByPk(id);
};

module.exports = { restoreRecord };

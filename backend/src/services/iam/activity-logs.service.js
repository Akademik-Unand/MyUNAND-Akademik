'use strict';

const { ActivityLog } = require('../../models');
const { paginate } = require('../../helpers/listQuery');
const AppError = require('../../helpers/AppError');

const LIST_OPTIONS = {
  searchFields: ['user_email', 'user_name', 'action', 'subject', 'summary', 'path', 'ip'],
  sortableFields: ['createdAt', 'action', 'subject', 'user_email', 'status_code'],
  filterableFields: ['action', 'subject', 'user_email'],
  defaultOrder: [['createdAt', 'DESC']],
};

const list = (query) => paginate(ActivityLog, query, LIST_OPTIONS);

const getById = async (id) => {
  const item = await ActivityLog.findByPk(id);
  if (!item) {
    throw new AppError('Jejak aktivitas dengan ID tersebut tidak ditemukan', 404);
  }
  return item;
};

module.exports = { list, getById };

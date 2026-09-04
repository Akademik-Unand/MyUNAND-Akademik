'use strict';

const { idParam, listQuery } = require('../common');

const list = listQuery(
  ['createdAt', 'action', 'subject', 'user_email', 'status_code'],
  ['action', 'subject', 'user_email']
);

module.exports = { list, idParam };

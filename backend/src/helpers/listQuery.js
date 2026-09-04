'use strict';

const { Op } = require('sequelize');

const RESERVED_PARAMS = ['page', 'limit', 'search', 'sortBy', 'sortOrder', 'filter', 'order', 'sort', 'trashed'];

const isTextType = (attribute) => {
  const type = String(attribute?.type ?? '').toLowerCase();
  return type.includes('char') || type.includes('text') || type.includes('string');
};

const buildListQuery = (Model, query = {}, options = {}) => {
  const {
    searchFields = [],
    sortableFields = [],
    filterableFields = [],
    defaultOrder = [['createdAt', 'DESC']],
  } = options;

  const attributeNames = Object.keys(Model.rawAttributes || {});
  const allowedSort = sortableFields.length > 0 ? sortableFields : attributeNames;
  const allowedFilter = filterableFields.length > 0 ? filterableFields : attributeNames;

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 100;
  const offset = (page - 1) * limit;
  const search = query.search;
  const sortBy = query.sortBy;
  const sortOrder = String(query.sortOrder || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const where = {};

  if (search && searchFields.length > 0) {
    where[Op.or] = searchFields.map((field) => ({
      [field]: { [Op.like]: `%${search}%` },
    }));
  }

  const applyFilter = (key, val) => {
    if (val === undefined || val === '' || !allowedFilter.includes(key) || !Model.rawAttributes[key]) {
      return;
    }
    where[key] = isTextType(Model.rawAttributes[key])
      ? { [Op.like]: `%${val}%` }
      : val;
  };

  const nestedFilter = query.filter;
  if (nestedFilter && typeof nestedFilter === 'object' && !Array.isArray(nestedFilter)) {
    for (const [key, val] of Object.entries(nestedFilter)) {
      applyFilter(key, val);
    }
  }

  for (const [key, val] of Object.entries(query)) {
    if (!RESERVED_PARAMS.includes(key)) {
      applyFilter(key, val);
    }
  }

  const order =
    sortBy && allowedSort.includes(sortBy) && Model.rawAttributes[sortBy]
      ? [[sortBy, sortOrder]]
      : defaultOrder;

  return { where, order, limit, offset, page };
};

const paginate = async (Model, query, options = {}) => {
  const { where, order, limit, offset, page } = buildListQuery(Model, query, options);
  const trashed = query.trashed;
  const findOptions = { ...(options.findOptions || {}) };
  if (Model.options.paranoid) {
    if (trashed === 'with') findOptions.paranoid = false;
    if (trashed === 'only') {
      findOptions.paranoid = false;
      where.deletedAt = { [Op.ne]: null };
    }
  }

  const { count, rows } = await Model.findAndCountAll({
    where,
    include: options.defaultInclude || [],
    order,
    limit,
    offset,
    distinct: true,
    ...findOptions,
  });

  return {
    rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 0,
    },
  };
};

module.exports = {
  RESERVED_PARAMS,
  buildListQuery,
  paginate,
};

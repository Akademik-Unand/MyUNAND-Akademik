'use strict';

const Joi = require('joi');

const idParam = Joi.object({
  id: Joi.string().uuid().required(),
});

const listQuery = (sortableFields = [], filterableFields = []) => {
  const sortBy = sortableFields.length
    ? Joi.string().valid(...sortableFields)
    : Joi.string();

  const filter = filterableFields.length
    ? Joi.object().pattern(
      Joi.string().valid(...filterableFields),
      Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
    )
    : Joi.object();

  return Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(200),
    search: Joi.string().allow(''),
    sortBy,
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC'),
    trashed: Joi.string().valid('with', 'only'),
    filter,
  });
};

module.exports = { idParam, listQuery };

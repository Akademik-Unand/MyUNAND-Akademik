'use strict';

const Joi = require('joi');
const { ORG_FILTER_FIELDS } = require('../helpers/academicFilters');

const idParam = Joi.object({
  id: Joi.string().uuid().required(),
});

const uniqueFields = (...groups) => [...new Set(groups.flat())];

const listQuery = (sortableFields = [], filterableFields = []) => {
  const sortBy = sortableFields.length
    ? Joi.string().valid(...sortableFields)
    : Joi.string();

  // Key filter organisasi (fakultas_id/departemen_id/program_studi_id) selalu
  // diizinkan karena middleware attachAbility menyuntikkannya sesuai scope user;
  // nilainya bisa array (mis. program_studi_id: [id1, id2]). 'id' dipakai
  // resource master (departemen/program-studi) pada scope yang lebih sempit.
  const filter = Joi.object().pattern(
    Joi.string().valid(...uniqueFields(['id'], filterableFields, ORG_FILTER_FIELDS)),
    Joi.alternatives().try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.array().items(Joi.string(), Joi.number())
    )
  );

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

module.exports = { idParam, listQuery, ORG_FILTER_FIELDS, uniqueFields };

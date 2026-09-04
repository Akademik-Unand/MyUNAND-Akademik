'use strict';

const Joi = require('joi');
const { idParam, listQuery } = require('../common');

const list = listQuery(["createdAt"], ["scp_id","cpmk_id"]);
const create = Joi.object({
    scp_id: Joi.string().uuid().required(),
    cpmk_id: Joi.string().uuid().required(),
});
const update = Joi.object({
    scp_id: Joi.string().uuid().allow(null),
    cpmk_id: Joi.string().uuid().allow(null),
});

module.exports = { list, create, update, idParam };

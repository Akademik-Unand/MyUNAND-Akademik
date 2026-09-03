'use strict';
const { Op } = require('sequelize');
const { success, notFound, validationError } = require('../helpers/response');

/**
 * Factory helper to generate complete REST CRUD operations for any Sequelize model
 * @param {import('sequelize').ModelStatic<any>} Model 
 * @param {Object} options 
 * @param {Array} [options.defaultInclude=[]] Default relations to include
 * @param {Array<string>} [options.searchFields=[]] Fields to search on ?search=...
 * @param {Array} [options.defaultOrder=[['createdAt', 'DESC']]]
 */
const createCrudController = (Model, options = {}) => {
  const {
    defaultInclude = [],
    searchFields = [],
    defaultOrder = [['createdAt', 'DESC']],
  } = options;

  return {
    async getAll(req, res, next) {
      try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100;
        const offset = (page - 1) * limit;
        const search = req.query.search;

        const where = {};

        // 1. Search across searchFields
        if (search && searchFields.length > 0) {
          where[Op.or] = searchFields.map((field) => ({
            [field]: { [Op.like]: `%${search}%` },
          }));
        }

        // 2. Direct filter query params (except page, limit, search, order)
        const reservedParams = ['page', 'limit', 'search', 'order', 'sort'];
        for (const [key, val] of Object.entries(req.query)) {
          if (!reservedParams.includes(key) && val !== undefined && val !== '') {
            // Check if Model has this attribute
            if (Model.rawAttributes[key]) {
              where[key] = val;
            }
          }
        }

        const { count, rows } = await Model.findAndCountAll({
          where,
          include: defaultInclude,
          order: defaultOrder,
          limit,
          offset,
          distinct: true,
        });

        return success(res, {
          message: `Data ${Model.name} berhasil diambil`,
          data: rows,
          pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
          },
        });
      } catch (err) {
        next(err);
      }
    },

    async getById(req, res, next) {
      try {
        const { id } = req.params;
        const item = await Model.findByPk(id, {
          include: defaultInclude,
        });

        if (!item) {
          return notFound(res, `${Model.name} dengan ID tersebut tidak ditemukan`);
        }

        return success(res, {
          message: `Detail ${Model.name} berhasil diambil`,
          data: item,
        });
      } catch (err) {
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const item = await Model.create(req.body);
        const reloaded = defaultInclude.length > 0 ? await Model.findByPk(item.id, { include: defaultInclude }) : item;
        return success(res, {
          code: 201,
          message: `${Model.name} berhasil ditambahkan`,
          data: reloaded,
        });
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const { id } = req.params;
        const item = await Model.findByPk(id);

        if (!item) {
          return notFound(res, `${Model.name} dengan ID tersebut tidak ditemukan`);
        }

        await item.update(req.body);
        const reloaded = defaultInclude.length > 0 ? await Model.findByPk(item.id, { include: defaultInclude }) : item;

        return success(res, {
          message: `${Model.name} berhasil diperbarui`,
          data: reloaded,
        });
      } catch (err) {
        next(err);
      }
    },

    async delete(req, res, next) {
      try {
        const { id } = req.params;
        const item = await Model.findByPk(id);

        if (!item) {
          return notFound(res, `${Model.name} dengan ID tersebut tidak ditemukan`);
        }

        await item.destroy();

        return success(res, {
          message: `${Model.name} berhasil dihapus`,
          data: { id },
        });
      } catch (err) {
        next(err);
      }
    },
  };
};

module.exports = createCrudController;

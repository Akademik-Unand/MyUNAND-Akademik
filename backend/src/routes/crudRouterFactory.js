'use strict';
const express = require('express');
const { authenticate } = require('../middleware/auth');

/**
 * Creates standard REST CRUD router
 * @param {Object} controller 
 * @param {Object} [options]
 * @param {boolean} [options.requireAuth=true]
 * @param {Array} [options.middlewares=[]]
 */
const createCrudRouter = (controller, options = {}) => {
  const router = express.Router();
  const { requireAuth = true, middlewares = [] } = options;

  if (requireAuth) {
    router.use(authenticate);
  }
  if (middlewares.length > 0) {
    router.use(middlewares);
  }

  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
};

module.exports = createCrudRouter;

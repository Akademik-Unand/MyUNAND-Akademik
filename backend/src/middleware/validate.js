'use strict';

const { validationError } = require('../helpers/response');

const formatDetails = (error) =>
  error.details.map((detail) => ({
    field: detail.path.join('.') || detail.context?.key,
    message: detail.message.replace(/"/g, ''),
  }));

const validatePart = (schema, payload) => {
  if (!schema) return { value: payload };
  return schema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false,
  });
};

const validate = ({ body, params, query } = {}) => (req, res, next) => {
  if (body) {
    const result = validatePart(body, req.body);
    if (result.error) {
      return validationError(res, formatDetails(result.error));
    }
    req.body = result.value;
  }

  if (params) {
    const result = validatePart(params, req.params);
    if (result.error) {
      return validationError(res, formatDetails(result.error));
    }
    req.params = result.value;
  }

  if (query) {
    const result = query.validate(req.query, {
      abortEarly: false,
      stripUnknown: false,
      allowUnknown: true,
    });
    if (result.error) {
      return validationError(res, formatDetails(result.error));
    }
    Object.defineProperty(req, 'query', {
      value: result.value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  return next();
};

module.exports = validate;

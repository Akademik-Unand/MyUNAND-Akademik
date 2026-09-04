'use strict';

const crypto = require('crypto');

const hashRefreshToken = (raw) => crypto.createHash('sha256').update(String(raw)).digest('hex');

const createRefreshTokenValue = () => crypto.randomBytes(48).toString('hex');

module.exports = { hashRefreshToken, createRefreshTokenValue };

process.env.NODE_ENV = 'test';
process.env.BCRYPT_ROUNDS = '4';

const jwt = require('jsonwebtoken');
const config = require('../config/env');

const tokenFor = (overrides = {}, options = {}) =>
  jwt.sign({ email: 'admin@email.com', ...overrides }, config.jwt.secret, {
    algorithm: 'HS256',
    subject: '1',
    issuer: config.jwt.issuer,
    expiresIn: '1h',
    ...options,
  });

const authHeader = (token = tokenFor()) => ({ Authorization: `Bearer ${token}` });

module.exports = { config, tokenFor, authHeader };

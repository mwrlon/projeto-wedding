const { rateLimit } = require('express-rate-limit');
const config = require('../config/env');

const buildHandler = (message) => (req, res) =>
  res.status(429).json({ success: false, message, error: message });

// Limite geral da API, por IP.
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: buildHandler('Muitas requisições. Tente novamente em instantes.'),
});

// Limite rígido para login: trava força bruta de senha.
// Só conta tentativas que falharam.
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.loginMax,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: buildHandler('Muitas tentativas de login. Aguarde alguns minutos.'),
});

module.exports = { apiLimiter, loginLimiter };

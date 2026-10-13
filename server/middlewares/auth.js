const jwt = require('jsonwebtoken');
const config = require('../config/env');
const AppError = require('../utils/AppError');

// Exige "Authorization: Bearer <token>" válido.
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Autenticação necessária.', 401));
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'], // impede ataque de troca de algoritmo (alg: none)
      issuer: config.jwt.issuer,
    });
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Sessão expirada.' : 'Token inválido.';
    next(new AppError(message, 401));
  }
};

module.exports = { authenticate };

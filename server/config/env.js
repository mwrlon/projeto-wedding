require('dotenv').config({ quiet: true });

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const toList = (value, fallback) =>
  (value ? value.split(',') : fallback).map((item) => item.trim()).filter(Boolean);

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  port: toInt(process.env.PORT, 3000),

  // Atrás de proxy reverso (nginx, Render, Railway...) defina TRUST_PROXY=1
  trustProxy: toInt(process.env.TRUST_PROXY, 0),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wedding_pass',
    poolMin: toInt(process.env.DB_POOL_MIN, 2),
    poolMax: toInt(process.env.DB_POOL_MAX, 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    issuer: 'wedding-pass',
  },

  cors: {
    origins: toList(process.env.CORS_ORIGINS, [
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ]),
  },

  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
    loginMax: toInt(process.env.LOGIN_RATE_LIMIT_MAX, 10),
  },

  bcryptRounds: toInt(process.env.BCRYPT_ROUNDS, 12),
};

// Falha cedo: sem segredo forte não existe autenticação segura.
if (!isTest) {
  if (!config.jwt.secret || config.jwt.secret.length < 32) {
    throw new Error(
      'JWT_SECRET ausente ou curto demais (mínimo 32 caracteres). ' +
        'Copie .env.example para .env e defina um valor. ' +
        'Dica: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
} else if (!config.jwt.secret) {
  config.jwt.secret = 'test-secret-test-secret-test-secret-123456';
}

module.exports = config;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.set('trust proxy', config.trustProxy);

// Cabeçalhos de segurança (CSP, nosniff, HSTS, remove X-Powered-By...)
app.use(helmet());

// CORS restrito a origens conhecidas (CORS_ORIGINS no .env)
app.use(
  cors({
    origin(origin, callback) {
      // Requisições sem Origin (curl, server-to-server) passam; navegadores precisam estar na lista.
      if (!origin || config.cors.origins.includes(origin)) return callback(null, true);
      callback(new Error('Origem não permitida pelo CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 600,
  })
);

// Limita o tamanho do body (evita payloads gigantes)
app.use(express.json({ limit: '10kb' }));

// Health check (sem auth, sem dados sensíveis)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

// Inicia o servidor só quando executado direto (node server/app.js), não ao ser importado nos testes.
if (require.main === module) {
  const db = require('./config/database');

  const server = app.listen(config.port, () => {
    console.log(`Servidor rodando na porta ${config.port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} recebido, encerrando...`);
    server.close(async () => {
      await db.destroy();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;

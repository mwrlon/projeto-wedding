// Arquivo separado: o contador do rate limit é global do processo.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { config } = require('./helpers');

const app = require('../app');
const usuarioModel = require('../models/usuario.model');

test('login: bloqueia força bruta com 429 após as tentativas falhas permitidas', async () => {
  const hash = await bcrypt.hash('certa', 4);
  usuarioModel.findByEmail = async () => ({ id: 1, email: 'admin@email.com', senha: hash });

  const falhas = config.rateLimit.loginMax;
  for (let i = 0; i < falhas; i += 1) {
    const res = await request(app).post('/api/login').send({ email: 'admin@email.com', senha: 'errada' });
    assert.equal(res.status, 401, `tentativa ${i + 1}`);
  }

  const bloqueada = await request(app).post('/api/login').send({ email: 'admin@email.com', senha: 'errada' });
  assert.equal(bloqueada.status, 429);
  assert.match(bloqueada.body.message, /tentativas/i);

  // Mesmo a senha certa fica bloqueada durante a janela
  const certa = await request(app).post('/api/login').send({ email: 'admin@email.com', senha: 'certa' });
  assert.equal(certa.status, 429);
});

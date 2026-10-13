const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config, tokenFor, authHeader } = require('./helpers');

const app = require('../app');
const usuarioModel = require('../models/usuario.model');
const convidadoModel = require('../models/convidado.model');
const checkinModel = require('../models/checkin.model');
const AppError = require('../utils/AppError');

const guestValido = {
  nome: 'Maria Souza',
  cpf: '12345678901',
  email: 'Maria@Email.com',
  mesa: '4',
};

describe('infra e cabeçalhos de segurança', () => {
  test('health check é público e traz headers do helmet', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-powered-by'], undefined);
    assert.ok(res.headers['content-security-policy']);
  });

  test('rota inexistente devolve 404 em JSON', async () => {
    const res = await request(app).get('/api/nada').set(authHeader());
    assert.equal(res.status, 404);
  });

  test('CORS: origem desconhecida é bloqueada', async () => {
    const res = await request(app).get('/health').set('Origin', 'https://site-malicioso.com');
    assert.equal(res.status, 403);
  });

  test('CORS: origem permitida recebe o header', async () => {
    const origem = config.cors.origins[0];
    const res = await request(app).get('/health').set('Origin', origem);
    assert.equal(res.status, 200);
    assert.equal(res.headers['access-control-allow-origin'], origem);
  });

  test('JSON malformado devolve 400', async () => {
    const res = await request(app)
      .post('/api/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');
    assert.equal(res.status, 400);
  });

  test('body acima do limite devolve 413', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'a@a.com', senha: 'x'.repeat(20000) });
    assert.equal(res.status, 413);
  });
});

describe('autenticação JWT', () => {
  const rotas = [
    ['get', '/api/guests'],
    ['post', '/api/guests'],
    ['delete', '/api/guests/1'],
    ['patch', '/api/guests/1/checkin'],
    ['get', '/api/checkin'],
    ['get', '/api/dashboard'],
    ['get', '/api/grafico-confirmacoes'],
  ];

  for (const [metodo, caminho] of rotas) {
    test(`${metodo.toUpperCase()} ${caminho} sem token -> 401`, async () => {
      const res = await request(app)[metodo](caminho);
      assert.equal(res.status, 401);
    });
  }

  test('token inválido -> 401', async () => {
    const res = await request(app).get('/api/guests').set(authHeader('abc.def.ghi'));
    assert.equal(res.status, 401);
  });

  test('token expirado -> 401', async () => {
    const expirado = tokenFor({}, { expiresIn: '-10s' });
    const res = await request(app).get('/api/guests').set(authHeader(expirado));
    assert.equal(res.status, 401);
    assert.match(res.body.error, /expirada/i);
  });

  test('token assinado com outro segredo -> 401', async () => {
    const falso = jwt.sign({ email: 'x@x.com' }, 'outro-segredo-qualquer-0123456789abcdef', {
      subject: '1',
      issuer: config.jwt.issuer,
    });
    const res = await request(app).get('/api/guests').set(authHeader(falso));
    assert.equal(res.status, 401);
  });

  test('token "alg: none" é rejeitado', async () => {
    const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const semAssinatura = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({
      sub: '1',
      iss: config.jwt.issuer,
    })}.`;
    const res = await request(app).get('/api/guests').set(authHeader(semAssinatura));
    assert.equal(res.status, 401);
  });

  test('token com issuer errado -> 401', async () => {
    const token = tokenFor({}, { issuer: 'outro-sistema' });
    const res = await request(app).get('/api/guests').set(authHeader(token));
    assert.equal(res.status, 401);
  });
});

describe('POST /api/login', () => {
  let hashCerto;

  beforeEach(async () => {
    hashCerto = await bcrypt.hash('admin123', 4);
    usuarioModel.findByEmail = async (email) =>
      email === 'admin@email.com' ? { id: 1, email, senha: hashCerto } : undefined;
    usuarioModel.updatePassword = async () => {};
  });

  test('credenciais corretas devolvem token válido', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@email.com', senha: 'admin123' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Login bem-sucedido!');

    const payload = jwt.verify(res.body.token, config.jwt.secret, { algorithms: ['HS256'] });
    assert.equal(payload.sub, '1');
    assert.equal(payload.iss, config.jwt.issuer);
    assert.ok(payload.exp > payload.iat);
  });

  test('o token emitido abre rotas protegidas', async () => {
    convidadoModel.list = async () => [];
    const login = await request(app)
      .post('/api/login')
      .send({ email: 'admin@email.com', senha: 'admin123' });
    const res = await request(app).get('/api/guests').set(authHeader(login.body.token));
    assert.equal(res.status, 200);
  });

  test('email normalizado (maiúsculas/espaços)', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: '  ADMIN@Email.com ', senha: 'admin123' });
    assert.equal(res.status, 200);
  });

  test('senha errada e email inexistente têm a MESMA resposta', async () => {
    const errada = await request(app)
      .post('/api/login')
      .send({ email: 'admin@email.com', senha: 'errada' });
    const inexistente = await request(app)
      .post('/api/login')
      .send({ email: 'ninguem@email.com', senha: 'admin123' });

    assert.equal(errada.status, 401);
    assert.equal(inexistente.status, 401);
    assert.deepEqual(errada.body, inexistente.body);
    assert.equal(errada.body.message, 'Email ou senha incorretos');
    assert.equal(errada.body.token, undefined);
  });

  test('campos ausentes -> 400', async () => {
    const res = await request(app).post('/api/login').send({ email: 'admin@email.com' });
    assert.equal(res.status, 400);
  });

  test('tentativa de injeção em objeto (NoSQL-style) -> 400', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: { $ne: null }, senha: { $ne: null } });
    assert.equal(res.status, 400);
  });

  test('conta antiga com senha em texto puro: loga e migra para bcrypt', async () => {
    let novoHash = null;
    usuarioModel.findByEmail = async () => ({ id: 2, email: 'cerimonialista@email.com', senha: 'cerimonial123' });
    usuarioModel.updatePassword = async (id, hash) => {
      assert.equal(id, 2);
      novoHash = hash;
    };

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'cerimonialista@email.com', senha: 'cerimonial123' });

    assert.equal(res.status, 200);
    assert.ok(novoHash && novoHash.startsWith('$2'));
    assert.equal(await bcrypt.compare('cerimonial123', novoHash), true);
  });

  test('senha em texto puro errada não migra nem loga', async () => {
    let chamou = false;
    usuarioModel.findByEmail = async () => ({ id: 2, email: 'c@email.com', senha: 'cerimonial123' });
    usuarioModel.updatePassword = async () => {
      chamou = true;
    };
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'c@email.com', senha: 'outra-coisa' });
    assert.equal(res.status, 401);
    assert.equal(chamou, false);
  });

  test('erro do banco no login não vaza detalhes', async () => {
    usuarioModel.findByEmail = async () => {
      throw new Error("Access denied for user 'root'@'localhost' (senha: admin)");
    };
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'admin@email.com', senha: 'admin123' });
    assert.equal(res.status, 500);
    assert.equal(res.body.error, 'Erro interno do servidor.');
    assert.deepEqual(res.body, { error: 'Erro interno do servidor.' });
  });
});

describe('convidados', () => {
  beforeEach(() => {
    convidadoModel.list = async () => [{ id: 1, nome: 'Ana', cpf: '111.111.111-01', mesa: 1, status: 'pendente' }];
    convidadoModel.count = async () => 120;
    convidadoModel.create = async () => 99;
    convidadoModel.remove = async () => 1;
  });

  test('GET /api/guests sem paginação devolve array (formato original)', async () => {
    const res = await request(app).get('/api/guests').set(authHeader());
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.headers['x-total-count'], undefined);
  });

  test('GET /api/guests com paginação aplica limit/offset e total', async () => {
    let args;
    convidadoModel.list = async (a) => {
      args = a;
      return [];
    };
    const res = await request(app).get('/api/guests?page=3&limit=20').set(authHeader());
    assert.equal(res.status, 200);
    assert.deepEqual(args, { limit: 20, offset: 40 });
    assert.equal(res.headers['x-total-count'], '120');
  });

  test('paginação inválida -> 400', async () => {
    const res = await request(app).get('/api/guests?limit=999999').set(authHeader());
    assert.equal(res.status, 400);
  });

  test('GET /api/checkin mantém a lista usada pelo dashboard', async () => {
    const res = await request(app).get('/api/checkin').set(authHeader());
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  });

  test('POST cria convidado e normaliza os dados', async () => {
    let recebido;
    convidadoModel.create = async (dados) => {
      recebido = dados;
      return 99;
    };
    const res = await request(app).post('/api/guests').set(authHeader()).send(guestValido);
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'Convidado cadastrado com sucesso!');
    assert.deepEqual(recebido, {
      nome: 'Maria Souza',
      cpf: '123.456.789-01',
      email: 'maria@email.com',
      mesa: 4,
    });
  });

  test('POST ignora campos extras (mass assignment)', async () => {
    let recebido;
    convidadoModel.create = async (dados) => {
      recebido = dados;
      return 1;
    };
    await request(app)
      .post('/api/guests')
      .set(authHeader())
      .send({ ...guestValido, status: 'confirmado', id: 1 });
    assert.equal(recebido.status, undefined);
    assert.equal(recebido.id, undefined);
  });

  const invalidos = {
    'nome vazio': { nome: '' },
    'nome com HTML': { nome: '<script>alert(1)</script>' },
    'cpf inválido': { cpf: '123' },
    'email inválido': { email: 'nao-e-email' },
    'mesa zero': { mesa: 0 },
    'mesa texto': { mesa: 'abc' },
  };
  for (const [nome, campo] of Object.entries(invalidos)) {
    test(`POST com ${nome} -> 400`, async () => {
      const res = await request(app)
        .post('/api/guests')
        .set(authHeader())
        .send({ ...guestValido, ...campo });
      assert.equal(res.status, 400);
      assert.ok(res.body.error);
    });
  }

  test('POST com CPF/email repetido -> 409 com mensagem amigável', async () => {
    convidadoModel.create = async () => {
      const err = new Error('dup');
      err.code = 'ER_DUP_ENTRY';
      err.sqlMessage = "Duplicate entry '123.456.789-01' for key 'convidados.cpf'";
      throw err;
    };
    const res = await request(app).post('/api/guests').set(authHeader()).send(guestValido);
    assert.equal(res.status, 409);
    assert.equal(res.body.error, 'CPF já cadastrado.');
  });

  test('DELETE existente -> 200', async () => {
    const res = await request(app).delete('/api/guests/5').set(authHeader());
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Convidado deletado com sucesso!');
  });

  test('DELETE inexistente -> 404', async () => {
    convidadoModel.remove = async () => 0;
    const res = await request(app).delete('/api/guests/5').set(authHeader());
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Convidado não encontrado.');
  });

  for (const id of ['abc', '1;DROP TABLE convidados', '-1', '0', '1.5']) {
    test(`DELETE com id inválido (${id}) -> 400`, async () => {
      const res = await request(app).delete(`/api/guests/${encodeURIComponent(id)}`).set(authHeader());
      assert.equal(res.status, 400);
    });
  }
});

describe('check-in', () => {
  test('sucesso', async () => {
    checkinModel.registrar = async () => {};
    const res = await request(app).patch('/api/guests/3/checkin').set(authHeader());
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Check-in realizado e registrado na tabela de logs!');
  });

  test('convidado inexistente -> 404', async () => {
    checkinModel.registrar = async () => {
      throw new AppError('Convidado não encontrado.', 404);
    };
    const res = await request(app).patch('/api/guests/3/checkin').set(authHeader());
    assert.equal(res.status, 404);
  });

  test('check-in repetido -> 409', async () => {
    checkinModel.registrar = async () => {
      throw new AppError('Check-in já realizado para este convidado.', 409);
    };
    const res = await request(app).patch('/api/guests/3/checkin').set(authHeader());
    assert.equal(res.status, 409);
  });

  test('id inválido -> 400', async () => {
    const res = await request(app).patch('/api/guests/abc/checkin').set(authHeader());
    assert.equal(res.status, 400);
  });
});

describe('dashboard e gráfico', () => {
  test('dashboard mantém o formato { total, confirmados, pendentes }', async () => {
    convidadoModel.stats = async () => ({ total: 30, confirmados: 10, pendentes: 20 });
    const res = await request(app).get('/api/dashboard').set(authHeader());
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { total: 30, confirmados: 10, pendentes: 20 });
  });

  test('gráfico mantém o formato [{ data, total }]', async () => {
    convidadoModel.confirmacoesPorDia = async () => [{ data: '2026-10-13', total: 4 }];
    const res = await request(app).get('/api/grafico-confirmacoes').set(authHeader());
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, [{ data: '2026-10-13', total: 4 }]);
  });
});

test('modelos: SQL gerado usa parâmetros (sem concatenar entrada)', () => {
  const db = require('../config/database');
  const { sql, bindings } = db('usuarios')
    .select('id', 'email', 'senha')
    .where({ email: "' OR '1'='1" })
    .first()
    .toSQL();
  assert.doesNotMatch(sql, /OR '1'/);
  assert.deepEqual(bindings.slice(0, 1), ["' OR '1'='1"]);
  assert.ok(crypto); // mantém o import usado
});

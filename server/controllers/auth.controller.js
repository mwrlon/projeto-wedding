const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const usuarioModel = require('../models/usuario.model');

const MENSAGEM_INVALIDA = 'Email ou senha incorretos';

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(value);

// Hash falso usado quando o email não existe: o tempo de resposta fica igual
// ao de uma senha errada e não dá para descobrir quais emails existem.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', config.bcryptRounds);

const plainTextEquals = (a, b) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

const authController = {
  async login(req, res) {
    const { email, senha } = req.validated.body;

    const user = await usuarioModel.findByEmail(email);

    let autenticado = false;

    if (!user) {
      await bcrypt.compare(senha, DUMMY_HASH);
    } else if (isBcryptHash(user.senha)) {
      autenticado = await bcrypt.compare(senha, user.senha);
    } else {
      // Conta antiga com senha em texto puro: valida e migra para bcrypt no ato.
      autenticado = plainTextEquals(senha, user.senha);
      if (autenticado) {
        const novoHash = await bcrypt.hash(senha, config.bcryptRounds);
        await usuarioModel.updatePassword(user.id, novoHash);
      }
    }

    if (!autenticado) {
      return res.status(401).json({ success: false, message: MENSAGEM_INVALIDA });
    }

    const token = jwt.sign({ email: user.email }, config.jwt.secret, {
      algorithm: 'HS256',
      subject: String(user.id),
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
    });

    res.json({ success: true, message: 'Login bem-sucedido!', token });
  },
};

module.exports = authController;

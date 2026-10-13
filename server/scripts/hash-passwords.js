// Converte senhas antigas em texto puro (tabela usuarios) para bcrypt.
// Uso: npm run hash-passwords
// É seguro rodar mais de uma vez: ignora quem já está com hash.
const bcrypt = require('bcryptjs');
const config = require('../config/env');
const db = require('../config/database');

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(value);

(async () => {
  try {
    const usuarios = await db('usuarios').select('id', 'email', 'senha');
    let convertidos = 0;

    for (const usuario of usuarios) {
      if (isBcryptHash(usuario.senha)) continue;
      const hash = await bcrypt.hash(usuario.senha, config.bcryptRounds);
      await db('usuarios').where({ id: usuario.id }).update({ senha: hash });
      convertidos += 1;
      console.log(`Senha convertida: ${usuario.email}`);
    }

    console.log(`Concluído. ${convertidos} de ${usuarios.length} usuário(s) convertido(s).`);
  } catch (error) {
    console.error('Falha ao converter senhas:', error.message);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
})();

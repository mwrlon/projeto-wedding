const db = require('../config/database');

const TABLE = 'usuarios';

const usuarioModel = {
  findByEmail(email) {
    return db(TABLE).select('id', 'email', 'senha').where({ email }).first();
  },

  findById(id) {
    return db(TABLE).select('id', 'email').where({ id }).first();
  },

  updatePassword(id, senhaHash) {
    return db(TABLE).where({ id }).update({ senha: senhaHash });
  },
};

module.exports = usuarioModel;

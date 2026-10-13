const db = require('../config/database');
const AppError = require('../utils/AppError');

const checkinModel = {
  // Confirma o convidado e grava o log na mesma transação.
  // O FOR UPDATE trava a linha: dois cliques simultâneos não geram check-in duplicado.
  registrar(convidadoId) {
    return db.transaction(async (trx) => {
      const convidado = await trx('convidados')
        .where({ id: convidadoId })
        .forUpdate()
        .first();

      if (!convidado) throw new AppError('Convidado não encontrado.', 404);
      if (convidado.status === 'confirmado') {
        throw new AppError('Check-in já realizado para este convidado.', 409);
      }

      await trx('convidados').where({ id: convidadoId }).update({ status: 'confirmado' });
      await trx('checkins').insert({ convidado_id: convidadoId });
    });
  },
};

module.exports = checkinModel;

const db = require('../config/database');

const TABLE = 'convidados';

const convidadoModel = {
  // Sem paginação devolve tudo (comportamento original, usado pelo front).
  // Com limit/offset permite escalar para listas grandes.
  list({ limit, offset } = {}) {
    const query = db(TABLE).select('*').orderBy('id', 'asc');
    if (limit) query.limit(limit).offset(offset || 0);
    return query;
  },

  async count() {
    const row = await db(TABLE).count('id as total').first();
    return Number(row.total);
  },

  findById(id) {
    return db(TABLE).where({ id }).first();
  },

  async create({ nome, cpf, email, mesa }) {
    const [id] = await db(TABLE).insert({ nome, cpf, email, mesa });
    return id;
  },

  remove(id) {
    return db(TABLE).where({ id }).del();
  },

  // Uma única ida ao banco em vez de três COUNT separados.
  async stats() {
    const row = await db(TABLE)
      .select(
        db.raw('COUNT(*) as total'),
        db.raw("COALESCE(SUM(status = 'confirmado'), 0) as confirmados"),
        db.raw("COALESCE(SUM(status = 'pendente'), 0) as pendentes")
      )
      .first();

    return {
      total: Number(row.total),
      confirmados: Number(row.confirmados),
      pendentes: Number(row.pendentes),
    };
  },

  confirmacoesPorDia() {
    return db(TABLE)
      .where({ status: 'confirmado' })
      .select(db.raw('DATE(atualizado_em) as data'))
      .count('id as total')
      .groupBy('data')
      .orderBy('data', 'asc');
  },
};

module.exports = convidadoModel;

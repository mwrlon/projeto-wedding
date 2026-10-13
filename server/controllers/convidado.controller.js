const convidadoModel = require('../models/convidado.model');
const AppError = require('../utils/AppError');

const DEFAULT_PAGE_SIZE = 50;

const convidadoController = {
  // GET /api/guests e GET /api/checkin
  // Sem ?page/?limit devolve a lista completa (formato original, array simples).
  // Com paginação, o total vem no header X-Total-Count.
  async listar(req, res) {
    const { page, limit } = req.validated?.query || {};

    if (page || limit) {
      const pageSize = limit || DEFAULT_PAGE_SIZE;
      const offset = ((page || 1) - 1) * pageSize;
      const [convidados, total] = await Promise.all([
        convidadoModel.list({ limit: pageSize, offset }),
        convidadoModel.count(),
      ]);
      res.set('X-Total-Count', String(total));
      return res.json(convidados);
    }

    res.json(await convidadoModel.list());
  },

  // POST /api/guests
  async criar(req, res) {
    const id = await convidadoModel.create(req.validated.body);
    res.status(201).json({ message: 'Convidado cadastrado com sucesso!', id });
  },

  // PUT /api/guests/:id
  async atualizar(req, res) {
    const { id } = req.validated.params;

    // Checa antes porque o MySQL pode informar 0 linhas afetadas quando nada mudou.
    const existente = await convidadoModel.findById(id);
    if (!existente) throw new AppError('Convidado não encontrado.', 404);

    await convidadoModel.update(id, req.validated.body);
    res.json({ message: 'Convidado atualizado com sucesso!' });
  },

  // DELETE /api/guests/:id
  async remover(req, res) {
    const { id } = req.validated.params;
    const removidos = await convidadoModel.remove(id);

    if (!removidos) throw new AppError('Convidado não encontrado.', 404);
    res.json({ message: 'Convidado deletado com sucesso!' });
  },
};

module.exports = convidadoController;

const checkinModel = require('../models/checkin.model');

const checkinController = {
  // PATCH /api/guests/:id/checkin
  async realizar(req, res) {
    const { id } = req.validated.params;
    await checkinModel.registrar(id);
    res.json({ message: 'Check-in realizado e registrado na tabela de logs!' });
  },
};

module.exports = checkinController;

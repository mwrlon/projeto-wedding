const convidadoModel = require('../models/convidado.model');

const dashboardController = {
  // GET /api/dashboard
  async resumo(req, res) {
    res.json(await convidadoModel.stats());
  },

  // GET /api/grafico-confirmacoes
  async graficoConfirmacoes(req, res) {
    res.json(await convidadoModel.confirmacoesPorDia());
  },
};

module.exports = dashboardController;

const convidadoModel = require('../model/convidadoModel');

async function buscarConvidados(req, res) {
  try {
    const convidados = await convidadoModel.listarConvidados();

    res.json(convidados);
  } catch (erro) {
    res.status(500).json({
      erro: 'Erro ao buscar convidados'
    });
  }
}

module.exports = {
  buscarConvidados
};
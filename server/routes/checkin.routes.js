const { Router } = require('express');
const convidadoController = require('../controllers/convidado.controller');
const validate = require('../middlewares/validate');
const { paginacaoQuery } = require('../validators/schemas');

const router = Router();

// GET /api/checkin  (lista usada pela tela de check-in e pelo dashboard)
router.get('/', validate({ query: paginacaoQuery }), convidadoController.listar);

module.exports = router;

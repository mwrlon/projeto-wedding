const { Router } = require('express');
const convidadoController = require('../controllers/convidado.controller');
const checkinController = require('../controllers/checkin.controller');
const validate = require('../middlewares/validate');
const { criarConvidadoBody, idParams, paginacaoQuery } = require('../validators/schemas');

const router = Router();

// GET    /api/guests
router.get('/', validate({ query: paginacaoQuery }), convidadoController.listar);

// POST   /api/guests
router.post('/', validate({ body: criarConvidadoBody }), convidadoController.criar);

// DELETE /api/guests/:id
router.delete('/:id', validate({ params: idParams }), convidadoController.remover);

// PATCH  /api/guests/:id/checkin
router.patch('/:id/checkin', validate({ params: idParams }), checkinController.realizar);

module.exports = router;

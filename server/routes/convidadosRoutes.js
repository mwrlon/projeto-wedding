const express = require('express');
const router = express.Router();

const convidadoController = require('../controller/convidadoController');

router.get('/convidados', convidadoController.buscarConvidados);

module.exports = router;
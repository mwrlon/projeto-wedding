const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');

const router = Router();

// GET /api/dashboard
router.get('/dashboard', dashboardController.resumo);

// GET /api/grafico-confirmacoes
router.get('/grafico-confirmacoes', dashboardController.graficoConfirmacoes);

module.exports = router;

const { Router } = require('express');
const { authenticate } = require('../middlewares/auth');
const authRoutes = require('./auth.routes');
const convidadoRoutes = require('./convidado.routes');
const checkinRoutes = require('./checkin.routes');
const dashboardRoutes = require('./dashboard.routes');

const router = Router();

// Rotas públicas
router.use(authRoutes);

// Tudo abaixo exige token JWT válido
router.use(authenticate);
router.use('/guests', convidadoRoutes);
router.use('/checkin', checkinRoutes);
router.use(dashboardRoutes);

module.exports = router;

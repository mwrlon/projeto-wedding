const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { loginLimiter } = require('../middlewares/rateLimiter');
const { loginBody } = require('../validators/schemas');

const router = Router();

// POST /api/login  (pública)
router.post('/login', loginLimiter, validate({ body: loginBody }), authController.login);

module.exports = router;

const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// ROTAS DE AUTENTICAÇÃO
router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);

// rota protegida
router.get('/me', authMiddleware, authCtrl.me);

// rota de teste
router.get('/teste', (req, res) => res.send('Auth router funcionando!'));

module.exports = router;
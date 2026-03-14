const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// listar todos (admin)
router.get('/', authMiddleware, (req, res) => {
  const users = db.prepare('SELECT id, email, username, isAdmin, created_at FROM users').all();
  res.json({ users });
});

// ver um usuário público (qualquer usuário autenticado pode ver)
router.get('/:id', authMiddleware, adminOnly, (req, res) => {
  const id = req.params.id;
  const user = db.prepare('SELECT id, email, username, isAdmin, created_at FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ user });
});

// editar próprio perfil (email opcional, username)
router.put('/me', authMiddleware, (req, res) => {
  const { username } = req.body;
  const userId = req.user.id;
  db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username || null, userId);
  const user = db.prepare('SELECT id, email, username, isAdmin FROM users WHERE id = ?').get(userId);
  res.json({ success: true, user });
});

// editar qualquer usuário (admin)
router.put('/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { username, email, isAdmin } = req.body;
  db.prepare('UPDATE users SET username = ?, email = ?, isAdmin = ? WHERE id = ?').run(username || null, email || null, isAdmin ? 1 : 0, id);
  const user = db.prepare('SELECT id, email, username, isAdmin FROM users WHERE id = ?').get(id);
  res.json({ success: true, user });
});

module.exports = router;
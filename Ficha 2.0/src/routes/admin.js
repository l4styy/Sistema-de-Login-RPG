const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// lista todos os usuários
router.get("/users", authMiddleware, adminOnly, (req, res) => {
    const users = db.prepare(`
        SELECT id, username, email, isAdmin, created_at
        FROM users
    `).all();

    res.json({ users });
});

// lista todas as fichas (depois vamos criar tabela ficha)
router.get("/fichas", authMiddleware, adminOnly, (req, res) => {
    const fichas = db.prepare(`
        SELECT *
        FROM fichas
    `).all();

    res.json({ fichas });
});

module.exports = router;

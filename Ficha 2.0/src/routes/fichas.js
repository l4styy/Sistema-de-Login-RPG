const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { authMiddleware } = require("../middleware/auth");

// criar ficha
router.post("/", authMiddleware, (req, res) => {
    const userId = req.user.id;

    const {
        classe,
        origem,
        atributos,
        pericias,
        nome,
        historia,
        medos,
        aparencia,
        foto
    } = req.body;

    const stmt = db.prepare(`
        INSERT INTO fichas (
            user_id, classe, origem, atributos, pericias,
            nome, historia, medos, aparencia, foto
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
        userId,
        classe,
        origem,
        JSON.stringify(atributos),
        JSON.stringify(pericias),
        nome,
        historia,
        medos,
        aparencia,
        foto
    );

    res.json({ success: true });
});

module.exports = router;

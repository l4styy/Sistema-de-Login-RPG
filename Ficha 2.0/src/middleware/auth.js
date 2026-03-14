const jwt = require("jsonwebtoken");
const db = require("../database/db");

const SECRET = process.env.JWT_SECRET || "segredo_muito_forte_troque_isto";

// Middleware básico (verifica login)
function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Não autenticado" });
    }

    try {
        const decoded = jwt.verify(token, SECRET);

        // busca o usuário no banco
        const user = db.prepare("SELECT id, email, username, isAdmin FROM users WHERE id = ?")
                       .get(decoded.id);

        if (!user) {
            return res.status(401).json({ error: "Usuário inválido" });
        }

        req.user = user; // 🔥 salva no request
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

// Middleware de ADMIN
function adminOnly(req, res, next) {
    if (!req.user || req.user.isAdmin !== 1) {
        return res.status(403).json({ error: "Acesso negado: admin apenas" });
    }
    next();
}

module.exports = { authMiddleware, adminOnly };

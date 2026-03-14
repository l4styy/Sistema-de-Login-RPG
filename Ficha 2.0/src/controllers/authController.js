const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const SECRET = process.env.JWT_SECRET || "segredo_muito_forte_troque_isto";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || null;

// helper para criar token
function createToken(payload, expiresIn) {
  return jwt.sign(payload, SECRET, { expiresIn });
}

module.exports = {
  register: async (req, res) => {
    try {
      const { email, username, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

      const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (exists) return res.status(400).json({ error: 'Email já cadastrado' });

      const hashed = await bcrypt.hash(password, 10);
      const isAdmin = (ADMIN_EMAIL && ADMIN_EMAIL.toLowerCase() === email.toLowerCase()) ? 1 : 0;

      db.prepare('INSERT INTO users (email, username, password, isAdmin) VALUES (?, ?, ?, ?)').run(email, username || null, hashed, isAdmin);
      return res.json({ success: true, message: isAdmin ? 'Conta criada (admin)' : 'Conta criada' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, remember } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) return res.status(400).json({ error: 'Email não encontrado' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ error: 'Senha incorreta' });

      // tempo: se "remember" -> 30 dias, senão 24 horas
      const tokenExpiry = remember ? '30d' : '24h';
      const token = createToken({ id: user.id }, tokenExpiry);

      // cookie options
      const cookieOptions = {
        httpOnly: true,
        // secure: true, // só habilite em HTTPS / produção
        sameSite: 'lax'
      };
      if (remember) {
        cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias em ms
      } // se não for remember, não setamos maxAge -> cookie de sessão

      res.cookie('token', token, cookieOptions);
      return res.json({ success: true, token, expiresIn: tokenExpiry });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro interno' });
    }
  },

  logout: (req, res) => {
    // limpa cookie
    res.clearCookie('token');
    return res.json({ success: true });
  },

  me: (req, res) => {
    // req.user definido pelo middleware
    return res.json({ user: req.user });
  }
};
const db = require("../database/db");

module.exports = {
  // Criar ficha (somente usuário logado)
  create: (req, res) => {
    const userId = req.user.id;
    const { nome, ocupacao, foto, atributos, pericias } = req.body;

    // validações básicas
    if (!nome) return res.status(400).json({ error: "Nome é obrigatório." });

    if (!atributos) return res.status(400).json({ error: "Atributos são obrigatórios." });
    if (!pericias) return res.status(400).json({ error: "Perícias são obrigatórias (6)." });

    // Valida limite de atributos 0-3
    try {
      const atr = JSON.parse(atributos);
      const valores = Object.values(atr);
      if (valores.some(v => v < 0 || v > 3)) {
        return res.status(400).json({ error: "Atributos devem estar entre 0 e 3." });
      }
    } catch (err) {
      return res.status(400).json({ error: "Atributos devem ser JSON válido." });
    }

    // Valida quantidade de perícias = 6
    try {
      const per = JSON.parse(pericias);
      if (Object.keys(per).length !== 6) {
        return res.status(400).json({ error: "A ficha deve ter exatamente 6 perícias." });
      }
    } catch (err) {
      return res.status(400).json({ error: "Perícias devem ser JSON válido." });
    }

    db.prepare(`
      INSERT INTO fichas (user_id, nome, ocupacao, foto, atributos, pericias)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, nome, ocupacao || null, foto || null, atributos, pericias);

    return res.json({ success: true });
  },

  // Listar fichas do próprio usuário
  myFichas: (req, res) => {
    const userId = req.user.id;

    const fichas = db.prepare(`
      SELECT * FROM fichas WHERE user_id = ?
    `).all(userId);

    res.json({ fichas });
  },

  // Ver ficha por ID (somente se for dono OU admin)
  getOne: (req, res) => {
    const id = req.params.id;
    const ficha = db.prepare(`SELECT * FROM fichas WHERE id = ?`).get(id);

    if (!ficha) return res.status(404).json({ error: "Ficha não encontrada." });

    if (ficha.user_id !== req.user.id && req.user.isAdmin !== 1) {
      return res.status(403).json({ error: "Sem permissão para acessar esta ficha." });
    }

    res.json({ ficha });
  },

  // Editar ficha (somente dono)
  update: (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    const ficha = db.prepare(`SELECT * FROM fichas WHERE id = ?`).get(id);
    if (!ficha) return res.status(404).json({ error: "Ficha não encontrada." });

    if (ficha.user_id !== userId) {
      return res.status(403).json({ error: "Você não pode editar esta ficha." });
    }

    const { nome, ocupacao, foto, atributos, pericias } = req.body;

    db.prepare(`
      UPDATE fichas SET
        nome = ?, ocupacao = ?, foto = ?, atributos = ?, pericias = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nome || ficha.nome,
      ocupacao || ficha.ocupacao,
      foto || ficha.foto,
      atributos || ficha.atributos,
      pericias || ficha.pericias,
      id
    );

    res.json({ success: true });
  },

  // Deletar ficha (somente dono)
  delete: (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    const ficha = db.prepare(`SELECT * FROM fichas WHERE id = ?`).get(id);
    if (!ficha) return res.status(404).json({ error: "Ficha não encontrada." });

    if (ficha.user_id !== userId) {
      return res.status(403).json({ error: "Você não pode deletar esta ficha." });
    }

    db.prepare(`DELETE FROM fichas WHERE id = ?`).run(id);

    res.json({ success: true });
  },
};

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'src', 'database.db'); // arquivo na raiz src
const db = new Database(dbPath);

console.log("DB carregado!");

// Checa se tabela existe e cria com colunas corretas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migração simples: se existir coluna com typo 'passowrd' e não existir 'password', copia dados
try {
  const info = db.prepare("PRAGMA table_info('users')").all();
  const cols = info.map(c => c.name);
  if (!cols.includes('password') && cols.includes('passowrd')) {
    console.log("Migrando coluna passowrd -> password ...");
    // criar tabela temporária com nome correto
    db.exec(`
      ALTER TABLE users RENAME TO users_old;
    `);
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        username TEXT,
        password TEXT NOT NULL,
        isAdmin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    // copiar dados da coluna errada (se existir)
    db.prepare(`
      INSERT INTO users (id, email, username, password, isAdmin, created_at)
      SELECT id, email, username, passowrd, isAdmin, created_at FROM users_old;
    `).run();
    db.exec(`DROP TABLE users_old;`);
    console.log("Migração concluída.");
  }
} catch (e) {
  console.error("Erro durante a checagem/migração do DB:", e.message);
}

// =============================
// Tabela de Fichas de Personagem
// =============================
db.exec(`
  CREATE TABLE IF NOT EXISTS fichas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    nome TEXT,
    classe TEXT,
    origem TEXT,

    atributos TEXT,     -- JSON
    pericias TEXT,       -- JSON

    historia TEXT,
    aparencia TEXT,
    medos TEXT,

    vida INTEGER,
    sanidade INTEGER,
    defesa INTEGER,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);


module.exports = db;

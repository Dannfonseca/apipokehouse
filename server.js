const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Conectar ao banco de dados SQLite (ou criar se não existir)
const db = new sqlite3.Database('./database.db');

// Criar uma tabela para armazenar o estado do site
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS site_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      currentIndex INTEGER NOT NULL
    )
  `);
});

// Middleware para permitir o uso de JSON no corpo das requisições
app.use(express.json());

// Rota para obter o estado atual
app.get('/state', (req, res) => {
  db.get('SELECT currentIndex FROM site_state ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ currentIndex: row ? row.currentIndex : 0 });
  });
});

// Rota para salvar o estado atual
app.post('/state', (req, res) => {
  const { currentIndex } = req.body;
  if (typeof currentIndex !== 'number') {
    return res.status(400).json({ error: 'currentIndex deve ser um número' });
  }

  db.run('INSERT INTO site_state (currentIndex) VALUES (?)', [currentIndex], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, id: this.lastID });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
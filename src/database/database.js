import * as SQLite from 'expo-sqlite';

// Abre uma conexão compartilhada com o banco local do aplicativo.
export const db = SQLite.openDatabaseSync(
  'orbita_financas.db'
);

// Cria as tabelas necessárias e ativa as restrições de chave estrangeira.
export async function initDatabase() {
  // Define as tabelas de categorias e lançamentos com validações no próprio SQLite.
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS lancamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT NOT NULL CHECK(length(trim(descricao)) > 0),
      valor REAL NOT NULL CHECK(valor > 0),
      tipo TEXT NOT NULL CHECK(tipo IN ('receita', 'despesa')),
      categoria_id INTEGER,
      data TEXT NOT NULL,
      FOREIGN KEY (categoria_id)
        REFERENCES categoria(id)
        ON DELETE SET NULL
    );
  `);

  
}
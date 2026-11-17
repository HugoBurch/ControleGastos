
import { db } from './database';

// Valida e normaliza nomes antes de gravá-los no banco.
function validarNome(nome) {
  // Converte entradas ausentes para texto vazio e remove espaços externos.
  const texto = String(nome ?? '').trim();

  // Aplica o tamanho mínimo exigido para uma categoria.
  if (texto.length < 2) {
    throw new Error(
      'A categoria deve ter pelo menos 2 caracteres.'
    );
  }

  // Limita o nome ao tamanho aceito pela interface e pelo cadastro.
  if (texto.length > 50) {
    throw new Error(
      'A categoria deve ter no máximo 50 caracteres.'
    );
  }

  return texto;
}

// Garante que o identificador de uma categoria seja um inteiro positivo.
function validarId(id) {
  // Normaliza valores numéricos recebidos como texto antes de validá-los.
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new Error('ID da categoria inválido.');
  }

  return numero;
}

// Impede nomes repetidos, ignorando opcionalmente a categoria em edição.
async function verificarDuplicidade(nome, ignorarId = null) {
  // A consulta não diferencia maiúsculas e minúsculas e exclui o ID em edição.
  const existente = await db.getFirstAsync(
    `SELECT id
     FROM categoria
     WHERE LOWER(nome) = LOWER(?)
       AND (? IS NULL OR id != ?)
     LIMIT 1`,
    [nome, ignorarId, ignorarId]
  );

  if (existente) {
    throw new Error('Essa categoria já está cadastrada.');
  }
}

// Criar
// Valida o nome e insere uma nova categoria.
export async function criarCategoria(nome) {
  const nomeValidado = validarNome(nome);

  await verificarDuplicidade(nomeValidado);

  return await db.runAsync(
    `INSERT INTO categoria (nome)
     VALUES (?)`,
    [nomeValidado]
  );
}

// Consultar
// Retorna as categorias em ordem alfabética, sem diferenciar maiúsculas.
export async function listarCategorias() {
  return await db.getAllAsync(
    `SELECT id, nome
     FROM categoria
     ORDER BY nome COLLATE NOCASE ASC`
  );
}

// Atualizar
// Atualiza o nome de uma categoria existente após validar os dados.
export async function atualizarCategoria(id, nome) {
  const identificador = validarId(id);
  const nomeValidado = validarNome(nome);

  await verificarDuplicidade(nomeValidado, identificador);

  const resultado = await db.runAsync(
    `UPDATE categoria
     SET nome = ?
     WHERE id = ?`,
    [nomeValidado, identificador]
  );

  if (resultado.changes === 0) {
    throw new Error('Categoria não encontrada.');
  }

  return resultado;
}

// Excluir
// Exclui uma categoria existente e sinaliza quando ela não foi encontrada.
export async function excluirCategoria(id) {
  const identificador = validarId(id);

  const resultado = await db.runAsync(
    `DELETE FROM categoria
     WHERE id = ?`,
    [identificador]
  );

  if (resultado.changes === 0) {
    throw new Error('Categoria não encontrada.');
  }

  return resultado;
}

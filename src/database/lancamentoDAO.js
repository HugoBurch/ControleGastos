
import { db } from './database';

// Valida identificadores usados nas operações de lançamento.
function validarId(id) {
  // Aceita identificadores numéricos, mas exige um inteiro positivo.
  const numero = Number(id);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new Error('Identificador inválido.');
  }

  return numero;
}

// Confere e normaliza os campos de um lançamento antes de persistir.
function validarLancamento(lancamento) {
  // Recusa valores que não representem um objeto de lançamento.
  if (!lancamento || typeof lancamento !== 'object') {
    throw new Error('Dados do lançamento inválidos.');
  }

  const descricao = String(lancamento.descricao ?? '').trim();
  const valor = Number(lancamento.valor);
  const tipo = lancamento.tipo;
  const data = lancamento.data;
  const categoriaId = lancamento.categoria_id ?? null;

  // Normaliza e limita a descrição antes de qualquer consulta ou gravação.
  if (descricao.length < 3) {
    throw new Error(
      'A descrição deve ter pelo menos 3 caracteres.'
    );
  }

  if (descricao.length > 100) {
    throw new Error(
      'A descrição deve ter no máximo 100 caracteres.'
    );
  }

  // Evita valores infinitos, inválidos ou iguais a zero.
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error('O valor deve ser maior que zero.');
  }

  // Só permite os dois tipos reconhecidos pelo restante do aplicativo.
  if (!['receita', 'despesa'].includes(tipo)) {
    throw new Error('Tipo de lançamento inválido.');
  }

  // Exige a data no formato ISO usado para ordenar e consultar os registros.
  if (typeof data !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error('Data inválida.');
  }

  // Confere também o calendário para rejeitar datas impossíveis, como 30/02.
  const [ano, mes, dia] = data.split('-').map(Number);
  const dataVerificada = new Date(ano, mes - 1, dia);

  if (
    dataVerificada.getFullYear() !== ano ||
    dataVerificada.getMonth() !== mes - 1 ||
    dataVerificada.getDate() !== dia
  ) {
    throw new Error('A data informada não existe.');
  }

  // A categoria é opcional; se informada, seu identificador também é validado.
  if (categoriaId !== null) {
    validarId(categoriaId);
  }

  return {
    descricao,
    valor,
    tipo,
    categoria_id: categoriaId,
    data,
  };
}

// Criar
// Valida e grava um novo lançamento financeiro.
export async function criarLancamento(lancamento) {
  const dados = validarLancamento(lancamento);

  return await db.runAsync(
    `INSERT INTO lancamento
      (descricao, valor, tipo, categoria_id, data)
     VALUES (?, ?, ?, ?, ?)`,
    [
      dados.descricao,
      dados.valor,
      dados.tipo,
      dados.categoria_id,
      dados.data,
    ]
  );
}

// Consultar todos os lançamentos
// Lista os lançamentos com o nome da categoria associada, quando houver.
export async function listarLancamentos() {
  // Mantém transações sem categoria por meio do LEFT JOIN.
  return await db.getAllAsync(
    `SELECT
       l.id,
       l.descricao,
       l.valor,
       l.tipo,
       l.categoria_id,
       l.data,
       c.nome AS categoria
     FROM lancamento l
     LEFT JOIN categoria c
       ON c.id = l.categoria_id
     ORDER BY l.data DESC, l.id DESC`
  );
}

// Consultar lançamento pelo identificador
// Busca os dados de um lançamento específico pelo identificador.
export async function buscarLancamentoPorId(id) {
  const identificador = validarId(id);

  return await db.getFirstAsync(
    `SELECT *
     FROM lancamento
     WHERE id = ?`,
    [identificador]
  );
}

// Atualizar
// Atualiza todos os campos de um lançamento já cadastrado.
export async function atualizarLancamento(id, lancamento) {
  const identificador = validarId(id);
  const dados = validarLancamento(lancamento);

  const resultado = await db.runAsync(
    `UPDATE lancamento
     SET descricao = ?,
         valor = ?,
         tipo = ?,
         categoria_id = ?,
         data = ?
     WHERE id = ?`,
    [
      dados.descricao,
      dados.valor,
      dados.tipo,
      dados.categoria_id,
      dados.data,
      identificador,
    ]
  );

  if (resultado.changes === 0) {
    throw new Error('Lançamento não encontrado.');
  }

  return resultado;
}

// Excluir
// Remove um lançamento e informa quando o identificador não existe.
export async function excluirLancamento(id) {
  const identificador = validarId(id);

  const resultado = await db.runAsync(
    `DELETE FROM lancamento
     WHERE id = ?`,
    [identificador]
  );

  if (resultado.changes === 0) {
    throw new Error('Lançamento não encontrado.');
  }

  return resultado;
}

// Resumo geral
// Calcula totais de receitas, despesas e saldo considerando todo o histórico.
export async function obterResumo() {
  const resultado = await db.getFirstAsync(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'receita'
         THEN valor ELSE 0 END), 0) AS receitas,
       COALESCE(SUM(CASE WHEN tipo = 'despesa'
         THEN valor ELSE 0 END), 0) AS despesas
     FROM lancamento`
  );

  const receitas = Number(resultado?.receitas ?? 0);
  const despesas = Number(resultado?.despesas ?? 0);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
  };
}

// Resumo mensal
// Calcula os totais financeiros dentro do mês e do ano informados.
export async function obterResumoMensal(ano, mes) {
  // Valida o período antes de montar os limites da consulta.
  if (!Number.isInteger(ano) || ano < 1 ||
      !Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error('Período inválido.');
  }

  const inicio =
    `${ano}-${String(mes).padStart(2, '0')}-01`;

  const proximoMes = new Date(ano, mes, 1);

  const fim = [
    proximoMes.getFullYear(),
    String(proximoMes.getMonth() + 1).padStart(2, '0'),
    '01',
  ].join('-');

  // Usa o primeiro dia do próximo mês como limite exclusivo do intervalo.
  const resultado = await db.getFirstAsync(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'receita'
         THEN valor ELSE 0 END), 0) AS receitas,
       COALESCE(SUM(CASE WHEN tipo = 'despesa'
         THEN valor ELSE 0 END), 0) AS despesas
     FROM lancamento
     WHERE data >= ? AND data < ?`,
    [inicio, fim]
  );

  const receitas = Number(resultado?.receitas ?? 0);
  const despesas = Number(resultado?.despesas ?? 0);

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
  };
}

// Despesas dos últimos 7 dias
// Monta os sete dias mais recentes e preenche o total de despesas de cada dia.
export async function obterGastosSemana() {
  const hoje = new Date();
  const dias = [];
  // Abrevia os dias da semana conforme a ordem retornada por getDay().
  const nomes = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Prepara os sete dias, incluindo dias sem despesas.
  for (let i = 6; i >= 0; i--) {
    const dia = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate() - i
    );

    const data = [
      dia.getFullYear(),
      String(dia.getMonth() + 1).padStart(2, '0'),
      String(dia.getDate()).padStart(2, '0'),
    ].join('-');

    dias.push({
      data,
      nome: nomes[dia.getDay()],
      valor: 0,
    });
  }

  // Busca no banco os totais diários de despesas do período.
  const registros = await db.getAllAsync(
    `SELECT data, SUM(valor) AS total
     FROM lancamento
     WHERE tipo = 'despesa'
       AND data BETWEEN ? AND ?
     GROUP BY data`,
    [dias[0].data, dias[6].data]
  );

  // Converte os resultados em um mapa para preencher cada dia rapidamente.
  const totais = new Map(
    registros.map(item => [
      item.data,
      Number(item.total),
    ])
  );

  // Retorna a semana completa com os valores encontrados ou zero.
  return dias.map(dia => ({
    ...dia,
    valor: totais.get(dia.data) ?? 0,
  }));
}

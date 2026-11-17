
import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import {
  criarLancamento,
  buscarLancamentoPorId,
  atualizarLancamento,
  excluirLancamento,
} from '../database/lancamentoDAO';

import { listarCategorias } from '../database/categoriaDAO';
import { useAppTheme } from '../contexts/ThemeContext';

// Cria ou edita uma entrada ou saída financeira.
export default function FormLancamentoScreen({ route, navigation }) {
  const { theme } = useAppTheme();

  const lancamentoId = route.params?.lancamentoId;
  const editando = lancamentoId != null;

  const tipo = route.params?.tipo === 'receita'
    ? 'receita'
    : 'despesa';

  // Guarda os campos do lançamento e os estados das operações da tela.
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [dataLancamento, setDataLancamento] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Carrega categorias e, no modo de edição, os dados já cadastrados.
  useEffect(() => {
    let ativo = true;

    // Busca informações necessárias e evita atualizar estado após desmontar.
    async function carregarDados() {
      try {
        setCarregando(true);

        const lista = await listarCategorias();

        if (!ativo) return;

        setCategorias(lista);

        if (editando) {
          const lancamento =
            await buscarLancamentoPorId(lancamentoId);

          if (!lancamento) {
            throw new Error('Lançamento não encontrado.');
          }

          if (!ativo) return;

          setDescricao(lancamento.descricao);
          setValor(String(lancamento.valor).replace('.', ','));
          setCategoriaId(lancamento.categoria_id);
          setDataLancamento(lancamento.data);
        }

        setErro('');
      } catch (error) {
        console.error(error);

        if (ativo) {
          setErro('Não foi possível carregar os dados.');
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [editando, lancamentoId]);

  // Converte a entrada decimal digitada para um número ou sinaliza formato inválido.
  function converterValor(texto) {
    const normalizado = texto.trim().replace(',', '.');

    if (!/^\d+(\.\d{1,2})?$/.test(normalizado)) {
      return NaN;
    }

    return Number(normalizado);
  }

  // Produz a data atual no formato usado para salvar no banco.
  function obterDataAtual() {
    const hoje = new Date();

    return [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0'),
    ].join('-');
  }

  // Valida os campos e cria ou atualiza o lançamento no banco de dados.
  async function salvar() {
    if (salvando || carregando) return;

    setErro('');

    // Verifica campos obrigatórios antes de montar os dados do lançamento.
    if (!descricao.trim()) {
      setErro('Informe a descrição do lançamento.');
      return;
    }

    const valorNumerico = converterValor(valor);

    // Impede valores que não sejam números positivos válidos.
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um valor válido maior que zero.');
      return;
    }

    // Confere se a categoria escolhida ainda pertence à lista carregada.
    if (
      categoriaId !== null &&
      !categorias.some((item) => item.id === categoriaId)
    ) {
      setErro('Selecione uma categoria válida.');
      return;
    }

    if (editando && !dataLancamento) {
      setErro('Os dados do lançamento não foram carregados.');
      return;
    }

    // Preserva a data original ao editar e usa a data atual ao criar.
    const lancamento = {
      descricao: descricao.trim(),
      valor: valorNumerico,
      tipo,
      categoria_id: categoriaId,
      data: editando
        ? dataLancamento
        : obterDataAtual(),
    };

    try {
      setSalvando(true);

      // Direciona a gravação para criação ou atualização conforme o modo da tela.
      if (editando) {
        await atualizarLancamento(lancamentoId, lancamento);
      } else {
        await criarLancamento(lancamento);
      }

      Alert.alert(
        'Sucesso!',
        editando
          ? 'Lançamento atualizado com sucesso!'
          : 'Lançamento cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error(error);
      setErro('Não foi possível salvar o lançamento.');
    } finally {
      setSalvando(false);
    }
  }

  // Pede confirmação e exclui o lançamento quando o usuário confirma.
  function confirmarExclusao() {
    if (!editando || salvando || carregando) return;

    Alert.alert(
      'Excluir lançamento',
      'Tem certeza que deseja excluir este lançamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setSalvando(true);

              await excluirLancamento(lancamentoId);

              Alert.alert(
                'Sucesso',
                'Lançamento excluído com sucesso!',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              console.error(error);

              Alert.alert(
                'Erro',
                'Não foi possível excluir o lançamento.'
              );
            } finally {
              setSalvando(false);
            }
          },
        },
      ]
    );
  }

  // Renderiza o formulário adaptável ao teclado e às plataformas móveis.
  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* Marca, título e instrução variam conforme entrada, saída ou edição. */}
        <Text
          style={[
            styles.marca,
            { color: theme.accent },
          ]}
        >
          ÓRBITA
        </Text>

        <Text
          style={[
            styles.titulo,
            { color: theme.text },
          ]}
        >
          {editando
            ? tipo === 'receita'
              ? 'Editar Entrada'
              : 'Editar Saída'
            : tipo === 'receita'
              ? 'Nova Entrada'
              : 'Nova Saída'}
        </Text>

        <Text
          style={[
            styles.subtitulo,
            { color: theme.secondary },
          ]}
        >
          {editando
            ? 'Atualize os dados do lançamento.'
            : tipo === 'receita'
              ? 'Registre um valor recebido.'
              : 'Registre uma despesa realizada.'}
        </Text>

        <View
          style={[
            styles.tipoContainer,
            { backgroundColor: theme.surface },
          ]}
        >
          <Text
            style={[
              styles.tipoLabel,
              { color: theme.accent },
            ]}
          >
            {tipo === 'receita' ? '↓ Entrada' : '↑ Saída'}
          </Text>
        </View>

        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Descrição
        </Text>

        {/* Campo de texto para identificar a movimentação financeira. */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              color: theme.text,
            },
          ]}
          placeholder={
            tipo === 'receita'
              ? 'Ex.: Salário mensal'
              : 'Ex.: Supermercado'
          }
          placeholderTextColor={theme.secondary}
          value={descricao}
          onChangeText={setDescricao}
          maxLength={100}
          editable={!carregando && !salvando}
        />

        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Valor
        </Text>

        {/* Campo decimal acompanhado do símbolo da moeda brasileira. */}
        <View
          style={[
            styles.valorContainer,
            { backgroundColor: theme.surface },
          ]}
        >
          <Text
            style={[
              styles.moeda,
              { color: theme.accent },
            ]}
          >
            R$
          </Text>

          <TextInput
            style={[
              styles.valorInput,
              { color: theme.text },
            ]}
            placeholder="0,00"
            placeholderTextColor={theme.secondary}
            keyboardType="decimal-pad"
            value={valor}
            onChangeText={setValor}
            editable={!carregando && !salvando}
          />
        </View>

        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Categoria
        </Text>

        {/* Opções de categoria, com indicação de carregamento ou lista vazia. */}
        {carregando ? (
          <ActivityIndicator
            size="small"
            color={theme.accent}
            style={{ marginVertical: 20 }}
          />
        ) : categorias.length === 0 ? (
          <Text
            style={[
              styles.semCategorias,
              { color: theme.secondary },
            ]}
          >
            Nenhuma categoria cadastrada.
            Cadastre categorias pelo Perfil.
          </Text>
        ) : (
          <View style={styles.categorias}>
            {categorias.map((categoria) => {
              const selecionada =
                categoriaId === categoria.id;

              return (
                <Pressable
                  key={categoria.id}
                  disabled={salvando}
                  onPress={() =>
                    setCategoriaId(
                      selecionada ? null : categoria.id
                    )
                  }
                  style={[
                    styles.categoriaBotao,
                    {
                      backgroundColor: selecionada
                        ? theme.accent
                        : theme.surface,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selecionada
                        ? theme.onAccent
                        : theme.text,
                      fontSize: 12,
                      fontWeight: selecionada
                        ? '700'
                        : '500',
                    }}
                  >
                    {categoria.nome}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Apresenta a mensagem de validação quando algum dado é inválido. */}
        {erro ? (
          <Text
            style={[
              styles.erro,
              { color: theme.danger },
            ]}
          >
            {erro}
          </Text>
        ) : null}

        {/* Salva o lançamento e indica visualmente quando a operação está ativa. */}
        <Pressable
          style={[
            styles.botaoSalvar,
            { backgroundColor: theme.accent },
            (salvando || carregando) &&
              styles.botaoDesabilitado,
          ]}
          onPress={salvar}
          disabled={salvando || carregando}
        >
          {salvando ? (
            <ActivityIndicator color={theme.onAccent} />
          ) : (
            <Text
              style={[
                styles.botaoTexto,
                { color: theme.onAccent },
              ]}
            >
              {editando
                ? 'Salvar alterações'
                : tipo === 'receita'
                  ? 'Salvar Entrada'
                  : 'Salvar Saída'}
            </Text>
          )}
        </Pressable>

        {/* Disponibiliza a exclusão somente ao editar um lançamento existente. */}
        {editando && (
          <Pressable
            style={[
              styles.botaoExcluir,
              { borderColor: theme.danger },
            ]}
            onPress={confirmarExclusao}
            disabled={
              salvando || carregando || !dataLancamento
            }
          >
            <Text
              style={[
                styles.textoExcluir,
                { color: theme.danger },
              ]}
            >
              Excluir lançamento
            </Text>
          </Pressable>
        )}

        {/* Fecha o formulário e retorna à tela anterior. */}
        <Pressable
          style={styles.botaoCancelar}
          onPress={() => navigation.goBack()}
          disabled={salvando}
        >
          <Text
            style={[
              styles.cancelarTexto,
              { color: theme.secondary },
            ]}
          >
            Cancelar
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Define o layout dos campos, seletores e botões do formulário.
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 50,
  },

  marca: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },

  titulo: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
  },

  subtitulo: {
    fontSize: 13,
    marginTop: 7,
    marginBottom: 25,
  },

  tipoContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    alignItems: 'center',
  },

  tipoLabel: {
    fontSize: 15,
    fontWeight: '700',
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 9,
  },

  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 22,
  },

  valorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 25,
  },

  moeda: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },

  valorInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 15,
  },

  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 25,
  },

  categoriaBotao: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 11,
  },

  semCategorias: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 25,
  },

  erro: {
    fontSize: 13,
    marginBottom: 15,
  },

  botaoSalvar: {
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 10,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoTexto: {
    fontSize: 15,
    fontWeight: '700',
  },

  botaoExcluir: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 14,
  },

  textoExcluir: {
    fontSize: 14,
    fontWeight: '600',
  },

  botaoCancelar: {
    padding: 17,
    alignItems: 'center',
    marginTop: 10,
  },

  cancelarTexto: {
    fontSize: 14,
  },
});


import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  criarCategoria,
  listarCategorias,
  atualizarCategoria,
  excluirCategoria,
} from '../database/categoriaDAO';

import { useAppTheme } from '../contexts/ThemeContext';

// Permite criar, editar, listar e excluir categorias financeiras.
export default function CategoriasScreen() {
  const { theme } = useAppTheme();

  // Mantém a lista e o estado do formulário de criação ou edição.
  const [categorias, setCategorias] = useState([]);
  const [nome, setNome] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Carrega do banco as categorias cadastradas.
  const carregarCategorias = useCallback(async () => {
    try {
      const dados = await listarCategorias();
      setCategorias(dados);
    } catch (error) {
      console.error(error);
      setErro('Erro ao carregar categorias.');
    }
  }, []);

  // Atualiza a lista ao retornar para esta tela.
  useFocusEffect(
    useCallback(() => {
      carregarCategorias();
    }, [carregarCategorias])
  );

  // Cria ou atualiza uma categoria e recarrega a lista após salvar.
  async function salvarCategoria() {
    if (salvando) return;

    setErro('');

    try {
      setSalvando(true);

      // Define se a operação atual deve criar uma categoria ou atualizar a existente.
      if (editandoId !== null) {
        await atualizarCategoria(editandoId, nome);
      } else {
        await criarCategoria(nome);
      }

      setNome('');
      setEditandoId(null);

      await carregarCategorias();
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  // Preenche o formulário com a categoria escolhida para edição.
  function editarCategoria(item) {
    setNome(item.nome);
    setEditandoId(item.id);
    setErro('');
  }

  // Limpa os campos e encerra o modo de edição.
  function cancelarEdicao() {
    setNome('');
    setEditandoId(null);
    setErro('');
  }

  // Solicita confirmação antes de excluir a categoria selecionada.
  function confirmarExclusao(item) {
    Alert.alert(
      'Excluir categoria',
      `Deseja excluir "${item.nome}"? Os lançamentos associados ficarão sem categoria.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Exclui o registro confirmado e encerra a edição se era o item atual.
              await excluirCategoria(item.id);

              if (editandoId === item.id) {
                cancelarEdicao();
              }

              await carregarCategorias();
            } catch (error) {
              Alert.alert('Erro', error.message);
            }
          },
        },
      ]
    );
  }

  // Renderiza o formulário e a lista de categorias com suas ações.
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* Identificação e título do gerenciamento de categorias. */}
      <Text
        style={[styles.marca, { color: theme.accent }]}
      >
        ÓRBITA
      </Text>

      <Text
        style={[styles.titulo, { color: theme.text }]}
      >
        Minhas categorias
      </Text>

      {/* Campo de nome e botão para criar ou salvar a categoria em edição. */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            color: theme.text,
          },
        ]}
        placeholder="Nome da categoria"
        placeholderTextColor={theme.secondary}
        value={nome}
        onChangeText={setNome}
        maxLength={50}
        editable={!salvando}
      />

      {/* Mensagens e ações contextuais do formulário. */}
      {erro ? (
        <Text style={{ color: theme.danger, marginBottom: 12 }}>
          {erro}
        </Text>
      ) : null}

      <Pressable
        style={[
          styles.botao,
          { backgroundColor: theme.accent },
          salvando && { opacity: 0.6 },
        ]}
        onPress={salvarCategoria}
        disabled={salvando}
      >
        <Text
          style={[
            styles.botaoTexto,
            { color: theme.onAccent },
          ]}
        >
          {salvando
            ? 'Salvando...'
            : editandoId !== null
              ? 'Salvar alterações'
              : '+ Adicionar categoria'}
        </Text>
      </Pressable>

      {editandoId !== null && (
        <Pressable
          style={styles.cancelar}
          onPress={cancelarEdicao}
          disabled={salvando}
        >
          <Text style={{ color: theme.secondary }}>
            Cancelar edição
          </Text>
        </Pressable>
      )}

      {/* Categorias cadastradas, cada uma com ações de editar e excluir. */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text
            style={[
              styles.vazio,
              { color: theme.secondary },
            ]}
          >
            Nenhuma categoria cadastrada.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              { backgroundColor: theme.surface },
            ]}
          >
            <Text
              style={[
                styles.nome,
                { color: theme.text },
              ]}
            >
              {item.nome}
            </Text>

            <Pressable
              onPress={() => editarCategoria(item)}
              style={styles.acao}
              disabled={salvando}
            >
              <Text style={{ color: theme.accent }}>
                Editar
              </Text>
            </Pressable>

            <Pressable
              onPress={() => confirmarExclusao(item)}
              style={styles.acao}
              disabled={salvando}
            >
              <Text style={{ color: theme.danger }}>
                Excluir
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

// Define o espaçamento e a aparência do formulário e dos itens da lista.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 35,
  },

  marca: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },

  titulo: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 25,
  },

  input: {
    padding: 15,
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 12,
  },

  botao: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  botaoTexto: {
    fontWeight: '700',
    fontSize: 14,
  },

  cancelar: {
    alignItems: 'center',
    padding: 12,
  },

  lista: {
    paddingTop: 22,
    paddingBottom: 40,
    flexGrow: 1,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  nome: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  acao: {
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  vazio: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 14,
  },
});

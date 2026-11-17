
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  SectionList,
  Pressable,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { listarLancamentos } from '../database/lancamentoDAO';

import TransacaoItem from '../components/TransacaoItem';
import { useAppTheme } from '../contexts/ThemeContext';

// Apresenta o histórico de lançamentos, agrupado por mês e filtrável por tipo.
export default function CarteiraScreen({ navigation }) {
  const { theme, saldoVisivel } = useAppTheme();

  // Guarda os lançamentos carregados, o filtro escolhido e o estado da tela.
  const [lancamentos, setLancamentos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Lê o histórico do banco e atualiza o estado de carregamento ou erro.
  const carregarLancamentos = useCallback(async () => {
    try {
      setCarregando(true);

      const dados = await listarLancamentos();

      setLancamentos(dados);
      setErro('');
    } catch (error) {
      console.error(error);
      setErro('Erro ao carregar o histórico.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Atualiza o histórico sempre que a tela recebe foco.
  useFocusEffect(
    useCallback(() => {
      carregarLancamentos();
    }, [carregarLancamentos])
  );

  // Aplica o filtro de tipo selecionado pelo usuário.
  const filtrados = lancamentos.filter(
    (item) => filtro === 'todos' || item.tipo === filtro
  );

  // Agrupa os lançamentos filtrados por ano e mês.
  const grupos = {};

  filtrados.forEach((item) => {
    const [ano, mes] = item.data.split('-').map(Number);

    const nomeMes = new Date(ano, mes - 1, 1)
      .toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });

    const chave =
      `${ano}-${String(mes).padStart(2, '0')}`;

    if (!grupos[chave]) {
      grupos[chave] = {
        title: nomeMes.toUpperCase(),
        data: [],
      };
    }

    grupos[chave].data.push(item);
  });

  // Ordena os grupos do mês mais recente para o mais antigo.
  const secoes = Object.keys(grupos)
    .sort((a, b) => b.localeCompare(a))
    .map((chave) => grupos[chave]);

  // Renderiza as opções de filtro e a lista seccionada do histórico.
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      {/* Cabeçalho da tela de histórico financeiro. */}
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
        Histórico financeiro
      </Text>

      {/* Filtros para exibir todos os lançamentos ou apenas um tipo. */}
      <View style={styles.filtros}>
        {[
          { label: 'Todos', valor: 'todos' },
          { label: 'Entradas', valor: 'receita' },
          { label: 'Saídas', valor: 'despesa' },
        ].map((opcao) => {
          const ativo = filtro === opcao.valor;

          return (
            <Pressable
              key={opcao.valor}
              onPress={() => setFiltro(opcao.valor)}
              style={[
                styles.filtro,
                {
                  backgroundColor: ativo
                    ? theme.accent
                    : theme.surface,
                },
              ]}
            >
              <Text
                style={{
                  color: ativo
                    ? theme.onAccent
                    : theme.text,
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                {opcao.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Lista os resultados agrupados por mês e permite abrir a edição. */}
      <SectionList
        sections={secoes}
        keyExtractor={(item) => String(item.id)}
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              styles.mes,
              {
                color: theme.secondary,
                backgroundColor: theme.background,
              },
            ]}
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TransacaoItem
            item={item}
            theme={theme}
            saldoVisivel={saldoVisivel}
            onPress={() =>
              navigation.navigate('FormLancamento', {
                lancamentoId: item.id,
                tipo: item.tipo,
              })
            }
          />
        )}
        ListEmptyComponent={
          <Text
            style={[
              styles.vazio,
              { color: theme.secondary },
            ]}
          >
            {carregando
              ? 'Carregando histórico...'
              : erro || 'Nenhum lançamento encontrado.'}
          </Text>
        }
        contentContainerStyle={styles.lista}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

// Define o layout da tela, dos filtros e dos cabeçalhos mensais.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  marca: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },

  titulo: {
    fontSize: 23,
    fontWeight: '700',
    marginTop: 7,
    marginBottom: 22,
  },

  filtros: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 18,
  },

  filtro: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },

  mes: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingVertical: 14,
  },

  lista: {
    paddingBottom: 30,
    flexGrow: 1,
  },

  vazio: {
    textAlign: 'center',
    marginTop: 45,
    fontSize: 14,
  },
});

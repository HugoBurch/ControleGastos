
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  obterResumo,
  listarLancamentos,
  obterGastosSemana,
} from '../database/lancamentoDAO';

import { useAppTheme } from '../contexts/ThemeContext';

import SaldoCard from '../components/SaldoCard';
import AcaoButton from '../components/AcaoButton';
import TransacaoItem from '../components/TransacaoItem';
import GraficoSemanal from '../components/GraficoSemanal';

import { icons } from '../../assets/icons';

// Reúne o resumo financeiro, os atalhos e as transações recentes.
export default function HomeScreen({ navigation }) {
  const {
    modo,
    theme,
    saldoVisivel,
    alternarSaldo,
    alternarTema,
  } = useAppTheme();

  // Guarda os totais, os lançamentos recentes, os dados semanais e possíveis erros.
  const [resumo, setResumo] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
  });

  const [lancamentos, setLancamentos] = useState([]);
  const [semana, setSemana] = useState([]);
  const [erro, setErro] = useState('');

  // Atualiza os dados da tela sempre que ela volta a receber foco.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      // Busca simultaneamente resumo, histórico e despesas da semana.
      async function carregar() {
        try {
          const [totais, lista, gastos] = await Promise.all([
            obterResumo(),
            listarLancamentos(),
            obterGastosSemana(),
          ]);

          if (!ativo) return;

          setResumo(totais);
          // Limita o trecho exibido na tela inicial aos cinco registros recentes.
          setLancamentos(lista.slice(0, 5));
          setSemana(gastos);
          setErro('');
        } catch (error) {
          console.error(error);

          if (ativo) {
            setErro('Erro ao carregar os dados.');
          }
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  // Abre o formulário já configurado para registrar entrada ou saída.
  function novoLancamento(tipo) {
    navigation.navigate('FormLancamento', { tipo });
  }

  // Renderiza o cabeçalho, resumo, atalhos, gráfico e lista recente.
  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      {/* Marca, descrição curta e controle acessível para alternar o tema. */}
      <View style={styles.cabecalho}>
        <View style={styles.marcaContainer}>
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
              styles.subtitulo,
              { color: theme.secondary },
            ]}
          >
            Seu dinheiro, no controle.
          </Text>
        </View>

        <Pressable
          onPress={alternarTema}
          style={[
            styles.botaoTema,
            { backgroundColor: theme.surface },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            modo === 'dark'
              ? 'Ativar tema claro'
              : 'Ativar tema escuro'
          }
        >
          <Image
            source={
              modo === 'dark'
                ? icons.lua
                : icons.sol
            }
            style={[
              styles.iconeTema,
              { tintColor: theme.accent },
            ]}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* Saldo total, resumo de entradas e saídas, com opção de ocultação. */}
      <SaldoCard
        saldo={resumo.saldo}
        receitas={resumo.receitas}
        despesas={resumo.despesas}
        saldoVisivel={saldoVisivel}
        onAlternarSaldo={alternarSaldo}
        theme={theme}
      />

      {/* Atalhos que abrem o formulário no tipo de lançamento escolhido. */}
      <View style={styles.acoes}>
        <AcaoButton
          titulo="Entrada"
          icone={icons.entrada}
          theme={theme}
          onPress={() => novoLancamento('receita')}
        />

        <AcaoButton
          titulo="Saída"
          icone={icons.saida}
          theme={theme}
          onPress={() => novoLancamento('despesa')}
        />
      </View>

      {/* Visualização dos gastos por dia da semana e do total correspondente. */}
      <View style={styles.grafico}>
        <GraficoSemanal
          dados={semana}
          theme={theme}
          saldoVisivel={saldoVisivel}
        />
      </View>

      {/* Cabeçalho do histórico recente com navegação para a carteira completa. */}
      <View style={styles.cabecalhoLista}>
        <Text
          style={[
            styles.tituloSecao,
            { color: theme.text },
          ]}
        >
          Transações recentes
        </Text>

        <Pressable
          onPress={() => navigation.navigate('Carteira')}
        >
          <Text style={{ color: theme.accent }}>
            Ver todas
          </Text>
        </Pressable>
      </View>

      {/* Exibe erro, estado vazio ou os cinco lançamentos mais recentes. */}
      {erro ? (
        <Text style={{ color: theme.danger }}>
          {erro}
        </Text>
      ) : lancamentos.length === 0 ? (
        <Text style={{ color: theme.secondary }}>
          Nenhuma transação cadastrada.
        </Text>
      ) : (
        lancamentos.map((item) => (
          <TransacaoItem
            key={item.id}
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
        ))
      )}
    </ScrollView>
  );
}

// Define espaçamentos e alinhamentos das seções da tela inicial.
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  marcaContainer: {
    flex: 1,
  },

  marca: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },

  subtitulo: {
    fontSize: 13,
    marginTop: 5,
  },

  botaoTema: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  iconeTema: {
    width: 25,
    height: 25,
  },

  acoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  grafico: {
    marginTop: 18,
  },

  cabecalhoLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },

  tituloSecao: {
    fontSize: 17,
    fontWeight: '700',
  },
});


import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  obterResumoMensal,
  obterGastosSemana,
} from '../database/lancamentoDAO';

import GraficoSemanal from '../components/GraficoSemanal';
import { useAppTheme } from '../contexts/ThemeContext';

// Mostra os totais do mês atual e a distribuição de despesas da semana.
export default function AnaliseScreen() {
  const { theme, saldoVisivel } = useAppTheme();

  // Guarda os dados financeiros, os gastos diários e o estado de carregamento.
  const [resumo, setResumo] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
  });

  const [semana, setSemana] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Formata valores em reais ou os mascara conforme a preferência do usuário.
  function formatar(valor) {
    if (!saldoVisivel) return '••••••';

    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  // Atualiza os dados sempre que a tela volta a ficar em foco.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      // Busca em paralelo o resumo mensal e os gastos dos últimos sete dias.
      async function carregar() {
        try {
          setCarregando(true);

          const hoje = new Date();

          const [totais, gastos] = await Promise.all([
            obterResumoMensal(
              hoje.getFullYear(),
              hoje.getMonth() + 1
            ),
            obterGastosSemana(),
          ]);

          if (ativo) {
            setResumo(totais);
            setSemana(gastos);
            setErro('');
          }
        } catch (error) {
          console.error(error);

          if (ativo) {
            setErro('Erro ao carregar análise.');
          }
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  // Exibe o cabeçalho, o gráfico semanal e os cartões do resumo mensal.
  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      {/* Identificação da marca e título da seção de análise. */}
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
        Análise financeira
      </Text>

      {/* Apresenta carregamento, erro ou os dados prontos para consulta. */}
      {carregando ? (
        <ActivityIndicator
          size="large"
          color={theme.accent}
        />
      ) : erro ? (
        <Text style={{ color: theme.danger }}>
          {erro}
        </Text>
      ) : (
        <>
          {/* Gráfico diário e total de gastos da semana. */}
          <GraficoSemanal
            dados={semana}
            theme={theme}
            saldoVisivel={saldoVisivel}
          />

          <Text
            style={[
              styles.secao,
              { color: theme.text },
            ]}
          >
            Resumo do mês
          </Text>

          {/* Cartões lado a lado com entradas e saídas do mês atual. */}
          <View style={styles.linha}>
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: theme.secondary },
                ]}
              >
                Entradas
              </Text>

              <Text
                style={[
                  styles.valor,
                  { color: theme.accent },
                ]}
              >
                {formatar(resumo.receitas)}
              </Text>
            </View>

            {/* Saldo líquido do mês, calculado a partir das entradas e saídas. */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface },
              ]}
            >
              <Text
                style={[
                  styles.label,
                  { color: theme.secondary },
                ]}
              >
                Saídas
              </Text>

              <Text
                style={[
                  styles.valor,
                  { color: theme.text },
                ]}
              >
                {formatar(resumo.despesas)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.saldoCard,
              { backgroundColor: theme.surface },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: theme.secondary },
              ]}
            >
              Saldo do mês
            </Text>

            <Text
              style={[
                styles.saldo,
                { color: theme.accent },
              ]}
            >
              {formatar(resumo.saldo)}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

// Define o espaçamento da tela e a hierarquia visual dos cartões de análise.
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
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

  secao: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 14,
  },

  linha: {
    flexDirection: 'row',
    gap: 10,
  },

  card: {
    flex: 1,
    padding: 15,
    borderRadius: 14,
  },

  label: {
    fontSize: 12,
  },

  valor: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },

  saldoCard: {
    borderRadius: 14,
    padding: 18,
    marginTop: 12,
  },

  saldo: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
});

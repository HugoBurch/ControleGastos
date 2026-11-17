
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

// Exibe os gastos recentes em formato de barras e total monetário.
export default function GraficoSemanal({
  dados = [],
  theme,
  saldoVisivel = true,
}) {
  // Obtém o maior valor para normalizar a altura das barras do gráfico.
  const maior = Math.max(
    1,
    ...dados.map((item) => Number(item.valor))
  );

  // Soma os valores apresentados para compor o total da semana.
  const total = dados.reduce(
    (soma, item) => soma + Number(item.valor),
    0
  );

  // Formata a soma como moeda brasileira.
  const moeda = total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Renderiza o total e uma coluna para cada dia recebido nos dados.
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface },
      ]}
    >
      {/* Identifica a métrica e exibe a soma semanal, se os valores estiverem visíveis. */}
      <Text
        style={[
          styles.label,
          { color: theme.secondary },
        ]}
      >
        Gastos da semana
      </Text>

      <Text
        style={[
          styles.total,
          { color: theme.text },
        ]}
      >
        {saldoVisivel ? moeda : '••••••'}
      </Text>

      {/* Cria uma barra por dia e destaca a maior despesa do período. */}
      <View style={styles.grafico}>
        {dados.map((item) => {
          const altura =
            (Number(item.valor) / maior) * 100;

          const destaque =
            item.valor > 0 && item.valor === maior;

          return (
            <View
              key={item.data}
              style={styles.coluna}
            >
              <View style={styles.areaBarra}>
                <View
                  style={[
                    styles.barra,
                    {
                      height: `${Math.max(altura, 5)}%`,
                      backgroundColor: destaque
                        ? theme.accent
                        : theme.border,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.dia,
                  { color: theme.secondary },
                ]}
              >
                {item.nome}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// Define o cartão, o gráfico de barras e os rótulos dos dias.
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
  },

  total: {
    fontSize: 25,
    fontWeight: '700',
    marginTop: 6,
  },

  grafico: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    marginTop: 20,
    gap: 9,
  },

  coluna: {
    flex: 1,
    alignItems: 'center',
  },

  areaBarra: {
    height: 110,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  barra: {
    width: '75%',
    borderRadius: 5,
    minHeight: 5,
  },

  dia: {
    fontSize: 10,
    marginTop: 8,
  },
});

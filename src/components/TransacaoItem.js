
import React from 'react';

import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { icons } from '../../assets/icons';

// Exibe uma transação individual com categoria, tipo e valor formatado.
export default function TransacaoItem({
  item,
  theme,
  onPress,
  saldoVisivel = true,
}) {
  // Identifica se o lançamento representa uma receita.
  const receita = item.tipo === 'receita';

  // Formata o valor da transação como moeda brasileira.
  const valor = Number(item.valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  // Renderiza os dados da transação e permite interação quando há ação.
  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Ícone indica visualmente se o lançamento é receita ou despesa. */}
      <View
        style={[
          styles.iconeContainer,
          { backgroundColor: theme.surface },
        ]}
      >
        <Image
          source={receita ? icons.entrada : icons.saida}
          style={[
            styles.icone,
            { tintColor: theme.accent },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Descrição principal e nome da categoria da movimentação. */}
      <View style={styles.informacoes}>
        <Text
          style={[
            styles.descricao,
            { color: theme.text },
          ]}
        >
          {item.descricao}
        </Text>

        <Text
          style={[
            styles.categoria,
            { color: theme.secondary },
          ]}
        >
          {item.categoria || 'Sem categoria'}
        </Text>
      </View>

      {/* Sinaliza a natureza do valor e mascara o montante quando necessário. */}
      <Text
        style={[
          styles.valor,
          {
            color: receita
              ? theme.accent
              : theme.text,
          },
        ]}
      >
        {saldoVisivel
          ? `${receita ? '+' : '−'} ${valor}`
          : '••••••'}
      </Text>
    </Pressable>
  );
}

// Define o alinhamento do item, do ícone e das informações da transação.
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },

  iconeContainer: {
    width: 40,
    height: 40,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icone: {
    width: 20,
    height: 20,
  },

  informacoes: {
    flex: 1,
  },

  descricao: {
    fontSize: 13,
    fontWeight: '600',
  },

  categoria: {
    fontSize: 11,
    marginTop: 4,
  },

  valor: {
    fontSize: 12,
    fontWeight: '600',
  },
});

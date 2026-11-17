
import React from 'react';

import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { icons } from '../../assets/icons';

// Apresenta saldo, entradas e saídas com controle para ocultar os valores.
export default function SaldoCard({
  saldo = 0,
  receitas = 0,
  despesas = 0,
  saldoVisivel = true,
  onAlternarSaldo,
  theme,
}) {
  // Converte um valor numérico para o formato monetário brasileiro.
  const formatar = (valor) =>
    Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  // Oculta o valor quando a preferência de privacidade está desativada.
  function exibir(valor) {
    return saldoVisivel ? formatar(valor) : '••••••';
  }

  // Renderiza o cartão financeiro e o botão de visibilidade do saldo.
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.accent },
      ]}
    >
      {/* Cabeçalho do cartão com controle para mostrar ou ocultar valores. */}
      <View style={styles.cabecalho}>
        <Text style={styles.label}>Saldo total</Text>

        <Pressable
          onPress={onAlternarSaldo}
          accessibilityLabel={
            saldoVisivel ? 'Ocultar saldo' : 'Mostrar saldo'
          }
        >
          <Image
            source={
              saldoVisivel
                ? icons.olho
                : icons.olhoFechado
            }
            style={styles.icone}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* Mostra o saldo total respeitando a preferência de privacidade. */}
      <Text style={styles.saldo}>
        {exibir(saldo)}
      </Text>

      <View style={styles.divisor} />

      {/* Compara os totais de receitas (entradas) e despesas (saídas). */}
      <View style={styles.resumo}>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoLabel}>Entradas</Text>
          <Text style={styles.resumoValor}>
            {exibir(receitas)}
          </Text>
        </View>

        <View style={styles.resumoItem}>
          <Text style={styles.resumoLabel}>Saídas</Text>
          <Text style={styles.resumoValor}>
            {exibir(despesas)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Define a estrutura e a aparência do cartão e de seus resumos.
const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 22,
  },

  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    color: '#354629',
    fontSize: 13,
    fontWeight: '600',
  },

  icone: {
    width: 22,
    height: 22,
    tintColor: '#17240D',
  },

  saldo: {
    color: '#17240D',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 12,
  },

  divisor: {
    height: 1,
    backgroundColor: 'rgba(23,36,13,0.18)',
    marginVertical: 20,
  },

  resumo: {
    flexDirection: 'row',
    gap: 15,
  },

  resumoItem: {
    flex: 1,
  },

  resumoLabel: {
    color: '#354629',
    fontSize: 12,
  },

  resumoValor: {
    color: '#17240D',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
});

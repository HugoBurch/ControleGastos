
import React from 'react';

import {
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { useAppTheme } from '../contexts/ThemeContext';
import { Image } from 'react-native';
import { icons } from '../../assets/icons';

// Exibe as preferências visuais e o acesso ao gerenciamento de categorias.
export default function PerfilScreen({ navigation }) {
  const {
    modo,
    theme,
    saldoVisivel,
    alternarTema,
    alternarSaldo,
  } = useAppTheme();

  // Apresenta os controles de tema, visibilidade de valores e categorias.
  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.container}
    >
      {/* Identificação da tela e título da área de configurações. */}
      <Text
        style={[styles.marca, { color: theme.accent }]}
      >
        ÓRBITA
      </Text>

      <Text
        style={[styles.titulo, { color: theme.text }]}
      >
        Perfil e ajustes
      </Text>

      <Text
        style={[styles.secao, { color: theme.secondary }]}
      >
        PREFERÊNCIAS
      </Text>

      {/* Preferências persistentes para aparência e privacidade dos valores. */}
      <View
        style={[
          styles.opcao,
          { backgroundColor: theme.surface },
        ]}
      >
        <View style={styles.informacoes}>
          <Text
            style={[styles.opcaoTexto, { color: theme.text }]}
          >
            Tema escuro
          </Text>

          <Text
            style={[
              styles.descricao,
              { color: theme.secondary },
            ]}
          >
            Alternar aparência do aplicativo
          </Text>
        </View>

        <Switch
          value={modo === 'dark'}
          onValueChange={alternarTema}
          trackColor={{
            false: theme.border,
            true: theme.accent,
          }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View
        style={[
          styles.opcao,
          { backgroundColor: theme.surface },
        ]}
      >
        <View style={styles.informacoes}>
          <Text
            style={[styles.opcaoTexto, { color: theme.text }]}
          >
            Mostrar valores
          </Text>

          <Text
            style={[
              styles.descricao,
              { color: theme.secondary },
            ]}
          >
            Exibir saldo e movimentações
          </Text>
        </View>

        <Switch
          value={saldoVisivel}
          onValueChange={alternarSaldo}
          trackColor={{
            false: theme.border,
            true: theme.accent,
          }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Seção de gerenciamento com acesso ao cadastro de categorias. */}
      <Text
        style={[styles.secao, { color: theme.secondary }]}
      >
        GERENCIAMENTO
      </Text>

      {/* Abre a tela que permite criar, editar e remover categorias. */}
      <Pressable
        style={[
          styles.opcao,
          { backgroundColor: theme.surface },
        ]}
        onPress={() => navigation.navigate('Categorias')}
      >
        <Text
          style={[styles.opcaoTexto, { color: theme.text }]}
        >
          Gerenciar categorias
        </Text>

        <Text style={{ color: theme.accent, fontSize: 24 }}>
          ›
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// Define a organização visual das seções e opções do perfil.
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
    marginBottom: 30,
  },

  secao: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 15,
  },

  opcao: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  informacoes: {
    flex: 1,
    paddingRight: 12,
  },

  opcaoTexto: {
    fontSize: 14,
    fontWeight: '600',
  },

  descricao: {
    fontSize: 11,
    marginTop: 5,
  },
});

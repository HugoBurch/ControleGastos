
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';

import { initDatabase } from './src/database/database';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Controla a inicialização do aplicativo e exibe a interface apropriada
// enquanto o banco de dados é preparado ou caso ocorra um erro.
export default function App() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setHidden(true);
    }
  }, []);

  // Inicializa o banco uma única vez e evita atualizar o estado após desmontar.
  useEffect(() => {
    let ativo = true;

    // Prepara o banco e atualiza o estado para liberar a navegação.
    async function iniciar() {
      try {
        await initDatabase();

        if (ativo) setPronto(true);
      } catch (error) {
        console.error('Erro ao iniciar banco:', error);

        if (ativo) {
          setErro('Não foi possível iniciar o banco de dados.');
        }
      }
    }

    // Dispara a preparação e impede atualizações caso o componente seja desmontado.
    iniciar();

    return () => {
      ativo = false;
    };
  }, []);

  // Mostra uma mensagem quando não foi possível preparar o banco de dados.
  if (erro) {
    return (
      <View style={styles.container}>
        <Text style={styles.erro}>{erro}</Text>
      </View>
    );
  }

  // Exibe a arte completa enquanto a inicialização está em andamento.
  if (!pronto) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('./assets/splash.png')}
          style={styles.splashImage}
          resizeMode="contain"
          accessible
          accessibilityLabel="Órbita Finanças está carregando."
        />
      </View>
    );
  }

  // Depois da inicialização, disponibiliza o tema e as telas de navegação.
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

// Define o layout compartilhado e as cores das telas de carregamento e erro.
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#031D27',
  },

  splashImage: {
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
    backgroundColor: '#101112',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  erro: {
    color: '#FF7777',
    textAlign: 'center',
  },
});


import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { themes } from '../styles/theme';

// Compartilha as preferências visuais e os dados de tema entre as telas.
const ThemeContext = createContext(null);

// Chaves usadas para persistir as preferências locais do aplicativo.
const TEMA_KEY = 'tema';
const SALDO_KEY = 'saldo_visivel';

// Carrega as preferências salvas e oferece ações para alterá-las.
export function ThemeProvider({ children }) {
  // Mantém o tema, a visibilidade do saldo e o estado de carregamento.
  const [modo, setModo] = useState('dark');
  const [saldoVisivel, setSaldoVisivel] = useState(true);
  const [carregando, setCarregando] = useState(true);

  // Recupera as preferências persistidas quando o provedor é montado.
  useEffect(() => {
    let ativo = true;

    // Lê as duas configurações em uma operação e aplica valores válidos.
    async function carregarPreferencias() {
      try {
        const valores = await AsyncStorage.multiGet([
          TEMA_KEY,
          SALDO_KEY,
        ]);

        const preferencias = Object.fromEntries(valores);

        // Descarta o resultado se o provedor já tiver sido desmontado.
        if (!ativo) return;

        const temaSalvo = preferencias[TEMA_KEY];

        // Restaura apenas os nomes de tema presentes na paleta configurada.
        if (temaSalvo === 'dark' || temaSalvo === 'light') {
          setModo(temaSalvo);
        }

        // Recupera a preferência booleana armazenada como texto.
        if (preferencias[SALDO_KEY] !== null) {
          setSaldoVisivel(
            preferencias[SALDO_KEY] === 'true'
          );
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarPreferencias();

    return () => {
      ativo = false;
    };
  }, []);

  // Atualiza o tema atual e grava a escolha no armazenamento local.
  async function alterarTema(novoModo) {
    // Ignora valores que não correspondam a um tema conhecido.
    if (!themes[novoModo]) return;

    setModo(novoModo);

    try {
      await AsyncStorage.setItem(TEMA_KEY, novoModo);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }

  // Alterna entre os temas claro e escuro.
  async function alternarTema() {
    await alterarTema(modo === 'dark' ? 'light' : 'dark');
  }

  // Alterna a exibição dos valores financeiros e persiste a escolha.
  async function alternarSaldo() {
    const novoValor = !saldoVisivel;

    setSaldoVisivel(novoValor);

    try {
      await AsyncStorage.setItem(
        SALDO_KEY,
        String(novoValor)
      );
    } catch (error) {
      console.error('Erro ao salvar visibilidade:', error);
    }
  }

  // Evita exibir as telas antes de terminar a leitura das preferências.
  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: themes.dark.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color={themes.dark.accent}
        />
      </View>
    );
  }

  // Disponibiliza tema, preferências e funções para os componentes filhos.
  return (
    <ThemeContext.Provider
      value={{
        modo,
        theme: themes[modo],
        saldoVisivel,
        alterarTema,
        alternarTema,
        alternarSaldo,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Retorna o contexto do tema e informa quando o provedor não está presente.
export function useAppTheme() {
  const contexto = useContext(ThemeContext);

  if (!contexto) {
    throw new Error(
      'useAppTheme deve ser usado dentro de ThemeProvider.'
    );
  }

  return contexto;
}

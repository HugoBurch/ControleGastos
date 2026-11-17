
import React from 'react';

import {
  Image,
  StyleSheet,
} from 'react-native';

import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import AnaliseScreen from '../screens/AnaliseScreen';
import CarteiraScreen from '../screens/CarteiraScreen';
import PerfilScreen from '../screens/PerfilScreen';
import CategoriasScreen from '../screens/CategoriasScreen';
import FormLancamentoScreen from '../screens/FormLancamentoScreen';

import { icons } from '../../assets/icons';
import { useAppTheme } from '../contexts/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Relaciona cada aba principal à tela e ao ícone correspondente.
const abas = [
  { name: 'Início', component: HomeScreen, icon: icons.inicio },
  { name: 'Análise', component: AnaliseScreen, icon: icons.analise },
  { name: 'Carteira', component: CarteiraScreen, icon: icons.carteira },
  { name: 'Perfil', component: PerfilScreen, icon: icons.perfil },
];

// Configura a navegação por abas e personaliza sua aparência com o tema atual.
function Tabs() {
  const { theme } = useAppTheme();

  // Configura as cores, os ícones e as telas da barra inferior.
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.secondary,

        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: 65,
          paddingBottom: 8,
          paddingTop: 7,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },

        tabBarIcon: ({ color }) => {
          const aba = abas.find(
            item => item.name === route.name
          );

          // Usa o ícone associado à rota e a cor do estado atual da aba.
          return (
            <Image
              source={aba.icon}
              style={[styles.icone, { tintColor: color }]}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      {abas.map(aba => (
        <Tab.Screen
          key={aba.name}
          name={aba.name}
          component={aba.component}
        />
      ))}
    </Tab.Navigator>
  );
}

// Configura a navegação principal, as telas auxiliares e o tema da navegação.
export default function AppNavigator() {
  const { modo, theme } = useAppTheme();

  // Usa as cores padrão compatíveis com o modo claro ou escuro selecionado.
  const base = modo === 'dark' ? DarkTheme : DefaultTheme;

  // Substitui as cores padrão pelos valores definidos no tema do aplicativo.
  const temaNavegacao = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.accent,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
    },
  };

  // Registra as abas e as telas de formulário dentro da navegação em pilha.
  return (
    <NavigationContainer theme={temaNavegacao}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="FormLancamento"
          component={FormLancamentoScreen}
          options={{ title: 'Lançamento' }}
        />

        <Stack.Screen
          name="Categorias"
          component={CategoriasScreen}
          options={{ title: 'Categorias' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Define dimensões consistentes para os ícones da barra de abas.
const styles = StyleSheet.create({
  icone: {
    width: 23,
    height: 23,
  },
});

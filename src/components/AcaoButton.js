
import React from 'react';

import {
  Pressable,
  Image,
  Text,
  StyleSheet,
} from 'react-native';

// Renderiza um botão de ação com ícone e título, seguindo o tema recebido.
export default function AcaoButton({
  titulo,
  icone,
  onPress,
  theme,
}) {
  // Combina o estilo base com as cores do tema para exibir a ação.
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.botao,
        { backgroundColor: theme.surface },
      ]}
    >
      {/* Ícone da ação, colorido conforme o destaque do tema ativo. */}
      <Image
        source={icone}
        style={[
          styles.icone,
          { tintColor: theme.accent },
        ]}
        resizeMode="contain"
      />

      {/* Rótulo textual que identifica a ação disponível. */}
      <Text
        style={[
          styles.texto,
          { color: theme.text },
        ]}
      >
        {titulo}
      </Text>
    </Pressable>
  );
}

// Define o formato, o espaçamento e a tipografia do botão de ação.
const styles = StyleSheet.create({
  // Área clicável que organiza ícone e texto verticalmente.
  botao: {
    flex: 1,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  // Dimensões padronizadas do ícone exibido no botão.
  icone: {
    width: 24,
    height: 24,
  },

  // Aparência do título da ação.
  texto: {
    fontSize: 13,
    fontWeight: '600',
  },
});

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Combina as regras recomendadas do Expo com exclusões locais do lint.
module.exports = defineConfig([
  expoConfig,
  {
    // Ignora a saída gerada de distribuição durante a análise estática.
    ignores: ['dist/*'],
  },
]);

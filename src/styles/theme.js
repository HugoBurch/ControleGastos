
// Centraliza as cores usadas pelas interfaces nos temas claro e escuro.
export const themes = {
  // Paleta de cores para a aparência escura.
  dark: {
    background: '#101112',
    surface: '#1C1F20',
    text: '#FFFFFF',
    secondary: '#929795',
    accent: '#B9F653',
    border: '#303535',
    danger: '#FF7777',
    onAccent: '#17240D',
    card: '#1C1F20',
    tabBar: '#101112',
  },

  // Paleta de cores para a aparência clara.
  light: {
    background: '#F5F6F2',
    surface: '#FFFFFF',
    text: '#172019',
    secondary: '#727A73',
    accent: '#A5DE43',
    border: '#E2E7DE',
    danger: '#D94141',
    onAccent: '#17240D',
    card: '#FFFFFF',
    tabBar: '#FFFFFF',
  },
};

// Mantém a paleta disponível como exportação padrão para outros módulos.
export default themes;

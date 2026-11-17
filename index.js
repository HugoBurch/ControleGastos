import { registerRootComponent } from 'expo';

import App from './App';

// Registra o componente raiz para que o Expo carregue o aplicativo nativo ou web.
// A função prepara o registro correto para o Expo Go e para builds nativos.
registerRootComponent(App);

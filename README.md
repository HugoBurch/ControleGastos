# 💰 Controle de Gastos

Aplicativo de **controle financeiro pessoal**, desenvolvido com **React Native e Expo**, para registrar receitas e despesas, acompanhar o saldo e visualizar a movimentação financeira em uma interface simples.

## 📱 Funcionalidades

- **Início:** visão geral das finanças e acesso rápido às principais ações.
- **Novo lançamento:** cadastro de receitas e despesas.
- **Histórico:** consulta dos lançamentos registrados.
- **Análise:** acompanhamento e interpretação das movimentações financeiras.
- **Carteira:** área dedicada às informações financeiras do usuário.
- **Tema claro e escuro:** alternância pela opção de sol/lua na tela inicial.
- **Navegação por ícones:** recursos visuais centralizados em `assets/icons.js`.

> As funcionalidades acima descrevem o escopo desenvolvido e discutido. Os detalhes de persistência e a estrutura completa devem ser conferidos no código-fonte antes da publicação.

## 🔄 Fluxo do aplicativo

```text
Usuário abre o aplicativo
          │
          ▼
       Início
          │
          ├── Novo lançamento
          │       │
          │       ├── Preenche os dados
          │       ├── Seleciona receita ou despesa
          │       └── Salva o lançamento
          │                 │
          │                 ▼
          │          Dados atualizados
          │                 │
          │       ┌─────────┼──────────┐
          │       ▼         ▼          ▼
          │     Início   Histórico   Análise
          │
          ├── Carteira
          └── Alternar tema ☀️ / 🌙
```

### Exemplo de utilização

1. O usuário acessa a tela **Início**.
2. Abre o formulário de **Novo lançamento**.
3. Registra uma despesa de R$ 50,00 com uma descrição.
4. Confirma o lançamento.
5. O registro passa a compor o **Histórico**, o **saldo** e as informações da **Análise**, conforme a implementação das telas.

**Regra básica de saldo:**

```text
Saldo = Total de receitas − Total de despesas
```

Por exemplo, com R$ 2.000,00 em receitas e R$ 650,00 em despesas, o saldo será **R$ 1.350,00**.

## 🗂️ Organização do projeto

Os caminhos abaixo mostram os arquivos mencionados durante o desenvolvimento e uma **estrutura de referência**. Ajuste os nomes e pastas conforme a versão atual do repositório.

```text
ControleDeGastos/
├── App.js                         # Entrada principal do aplicativo
├── app.json                       # Configurações do projeto Expo
├── package.json                   # Dependências e scripts
├── assets/
│   ├── icons.js                   # Centraliza as referências aos ícones
│   └── icons/                     # Imagens usadas na navegação e interface
│       ├── inicio.png
│       ├── historico.png
│       └── analise.png
└── ...                             # Demais telas e módulos do projeto
```

### O que cada parte faz?

| Arquivo ou pasta | Responsabilidade |
| --- | --- |
| `App.js` | Inicializa o aplicativo e conecta sua estrutura principal. |
| `app.json` | Define metadados e configurações do Expo. |
| `package.json` | Lista bibliotecas, versões e comandos do projeto. |
| `assets/` | Guarda recursos visuais estáticos. |
| `assets/icons.js` | Exporta os caminhos dos ícones para reutilização. |
| `assets/icons/` | Contém os arquivos de imagem dos ícones. |
| `FormLacamentoScreen.js` | Tela do formulário para cadastrar lançamentos financeiros. O caminho exato depende da organização atual. |
| Telas de Início, Histórico, Análise e Carteira | Exibem diferentes perspectivas dos dados financeiros. |

## 🧠 Como os componentes se relacionam

O **formulário** recebe e valida as informações do usuário. Após salvar, os dados precisam ser disponibilizados para as telas que os utilizam. A tela **Início** resume o saldo, o **Histórico** apresenta os registros e a **Análise** utiliza os lançamentos para produzir indicadores. A forma concreta de compartilhar e armazenar esses dados depende da implementação existente.

Os **ícones** ficam separados do código das telas, facilitando a manutenção. O **tema** modifica a aparência da interface, sem alterar os valores financeiros.

## 🛠️ Tecnologias

- JavaScript
- React Native
- Expo

## ▶️ Executar em desenvolvimento

É necessário ter o **Node.js** instalado.

```bash
# Instalar dependências
npm install

# Iniciar o Expo
npx expo start
```

Depois, abra o projeto com o **Expo Go** em um dispositivo compatível ou utilize um emulador configurado. Os comandos podem variar conforme os scripts e dependências presentes no `package.json`.

## 📌 Objetivo do projeto

Praticar o desenvolvimento mobile e a organização de um aplicativo financeiro, incluindo criação de telas, formulários, navegação, gerenciamento de dados e personalização visual.

## 📚 Documentação

O projeto possui um guia didático complementar sobre o fluxo das informações e a responsabilidade dos arquivos. Ele pode ser adicionado ao repositório na pasta `docs/` para consulta durante os estudos.

---

**Projeto:** Controle de Gastos  
**Plataforma:** Android e iOS (React Native / Expo)

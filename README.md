# 💧 HydroBalance Pro

**Sistema de Balanço Hídrico Mineral** — ICMM 2021 · GRI 303 · GT10/IBRAM

## Requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** 9+

## Instalação

```bash
# 1. Acesse a pasta do projeto
cd hydrobalance

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

O sistema abrirá automaticamente em `http://localhost:3000`

## Uso no Celular (mesma rede Wi-Fi)

Após rodar `npm run dev`, o Vite mostra um endereço de rede tipo:

```
  ➜  Network: http://192.168.1.XX:3000/
```

Abra esse endereço no navegador do celular (conectado na mesma rede Wi-Fi).

## Build para Produção

```bash
npm run build
```

Gera a pasta `dist/` com os arquivos otimizados. Você pode:
- Abrir `dist/index.html` direto no navegador
- Hospedar em qualquer servidor estático
- Usar `npx serve dist` para servir localmente

## Estrutura do Projeto

```
hydrobalance/
├── index.html              # Entry point HTML
├── package.json            # Dependências e scripts
├── vite.config.js          # Configuração Vite
├── public/
│   └── favicon.svg
└── src/
    ├── main.js             # Inicialização (boot)
    ├── styles/
    │   ├── variables.css   # Design tokens / CSS vars
    │   ├── layout.css      # Header, sidebar, workspace
    │   ├── components.css  # Cards, forms, tabelas
    │   └── responsive.css  # Mobile + print
    ├── components/
    │   ├── calculator.js   # Motor de cálculo do balanço
    │   ├── tabs.js         # Navegação por abas
    │   ├── diagram.js      # Diagrama Canvas
    │   ├── report.js       # Relatório consolidado
    │   ├── ai-analysis.js  # Análise via API Anthropic
    │   ├── export-excel.js # Exportação XLSX
    │   └── export-pdf.js   # Exportação PDF
    └── utils/
        ├── helpers.js      # Funções utilitárias (fmt, V, El)
        └── storage.js      # Persistência localStorage
```

## Funcionalidades

- ✅ 8 abas de preenchimento (Perfil → Relatório)
- ✅ Cálculos automáticos em tempo real
- ✅ Sidebar com métricas ao vivo
- ✅ Diagrama de fluxo hídrico (Canvas)
- ✅ Exportação Excel (.xlsx) e PDF
- ✅ Análise por IA (API Anthropic)
- ✅ **Dados salvos automaticamente** (localStorage)
- ✅ **Layout responsivo** (desktop + mobile)
- ✅ Impressão otimizada

## Tecnologias

- **Vite** — bundler + dev server
- **Vanilla JS** — ES Modules, sem framework
- **SheetJS (xlsx)** — exportação Excel
- **jsPDF + AutoTable** — exportação PDF
- **API Anthropic** — análise por IA

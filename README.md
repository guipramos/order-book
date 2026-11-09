# 📈 Order Book - High Performance UI

Simulação de um Livro de Ofertas (Order Book) de alta volumetria para bolsas de valores.

Este projeto demonstra como lidar com uma enxurrada de dados via WebSocket (100+ mensagens por segundo) sem travar a Main Thread do JavaScript, mantendo a interface (UI) fluida e o consumo de memória controlado.

## 🚨 O Problema (Abordagem Ingênua)

Em um terminal de trading real, os dados mudam dezenas de vezes por segundo. Se o front-end repassar cada mensagem do WebSocket diretamente para o estado do React (`setState`), teremos:

1. **Gargalo de CPU:** O React tentará reconciliar a árvore e atualizar o DOM dezenas de vezes por milissegundo. A UI congela ("Render Blocking").
2. **Gargalo de Memória:** Tentar renderizar 50.000 nós no DOM simultaneamente vai quebrar a aba do navegador ("Aw, Snap!").

## 💡 A Solução (Arquitetura Adotada)

Para manter a plataforma resiliente, este projeto separa a _chegada dos dados_ da _renderização visual_ utilizando três pilares arquiteturais:

1. **Buffer Invisível (`useRef`):** As mensagens que chegam do WebSocket não atualizam o estado do React. Elas são armazenadas silenciosamente em uma referência mutável, atuando como uma "represa" sem engatilhar re-renderizações.
2. **Throttling (`setInterval`):** Um loop assíncrono controlado "tira uma foto" do buffer a cada 200ms (frequência ideal para leitura humana), atualiza o estado oficial de forma unificada (lote) e esvazia a represa.
3. **Virtualização de Lista (`react-virtuoso`):** Ao invés de criar milhares de tags `<tr>` no DOM, a tabela renderiza estritamente os ~20 nós HTML que cabem fisicamente na altura da tela do usuário, reciclando a memória durante o scroll.

## 🛠️ Tecnologias Utilizadas

- **React + Vite** (com TypeScript)
- **WebSocket** (Nativo da Web API)
- **react-virtuoso** (Para virtualização do DOM)
- **Node.js + ws** (Gerador de dados / Fake Backend)

## 🚀 Como Rodar o Projeto

**1. Iniciando o Fake Backend (Gerador de Ordens):**
Este servidor gera intencionalmente de 50 a 100 ordens falsas por segundo.
\`\`\`bash
cd server
npm install
node index.js
\`\`\`

**2. Iniciando o Front-end (Terminal de Trading):**
\`\`\`bash
cd web
npm install
npm run dev
\`\`\`

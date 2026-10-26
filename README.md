# CRM NEXUS - Inteligência Comercial e Gestão de Vendas

Sistema avançado de gestão e inteligência comercial para equipes de vendas B2B e distribuição, orientado a dados e automação do histórico de compras.

---

## 🎯 Principais Módulos

### 1. 📋 Plano do Dia (Gestão de Workflow)
- **Fila Priorizada Algoritmicamente**: Ranqueamento de atendimento baseado em dinheiro na mesa, atraso do ciclo de recompra e gravidade de risco de churn.
- **Foco do Vendedor**: Stepper interativo com métricas operacionais (Ciclo Médio, Última Compra, Potencial Estimado R$, Dinheiro na Mesa).
- **Diagnóstico Comercial**: Alertas em tempo real indicando as causas da perda de tração da conta.
- **Ações Imediatas**:
  - 💬 **WhatsApp Inteligente**: Script de abordagem gerado automaticamente com produtos recomendados e link direto para WhatsApp Web.
  - 📞 **Ligação / Telefone**: Atalho de contato direto.
  - 🔍 **Raio-X 360°**: Histórico financeiro, penetração de mix e interações anteriores.
- **Registro de Resultados**: Registro de contatos (Ligação, WhatsApp, Visita, Pedido Fechado 🎉, Reagendamento) avançando sequencialmente pela fila.

### 2. 🧠 Inteligência de Vendas (Módulo Analítico)
- **Detecção de Quedas & Churn**: Identificação de clientes reduzindo volume, faturamento ou frequência de compras (MoM e YoY).
- **Análise de Recorrência**: Curva de reposição com mapeamento de lead time e alertas de desvio de estoque.
- **Sugestão de Pedidos**: Recomendações de SKUs de maior probabilidade cruzadas com o giro habitual de consumo do cliente.

### 3. 📊 Comparativo de Desempenho Multi-Período
- Comparação direta: **Mês Atual vs Mês Anterior (M-1) vs Mesmo Mês do Ano Anterior (YoY)**.
- Gráficos de barras comparativas e visualização por cliente ou por linha de produto (Linha Seca, Laticínios & Refrigerados, Congelados, Bebidas, Higiene & Limpeza).

### 4. 🎯 Expansão de Mix & Cross-Selling
- Matriz de penetração de categorias por cliente.
- Cálculo do "Dinheiro Oculto" (receita incremental potencial de linhas não ativadas).

### 5. 👥 Carteira & Redes Econômicas
- Gestão consolidada por grupos e redes comerciais (Matriz e Filiais) e clientes avulsos.

### 6. 🎨 Seletor Multi-Temas
- 🌙 **Dark Slate (Padrão)**: Interface dark cyber moderna com realces em esmeralda.
- ☀️ **Light Clean**: Visual executivo claro e de alto contraste.
- 🌊 **Royal Navy**: Azul marinho corporativo com detalhes em ciano e safira.
- 👑 **Obsidian Gold**: Acabamento luxuoso em tons âmbar e dourado.

---

## 🛠️ Tecnologias Utilizadas

- **React 19** + **TypeScript**
- **Vite**
- **Vanilla CSS Tokens** (sem Tailwind, máxima flexibilidade e controle)
- **Lucide React** (Ícones modernos)
- **Canvas Confetti** (Efeitos visuais)

---

## 🚀 Como Executar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/luan-nogueira/CRM-NEXUS.git
cd CRM-NEXUS
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:5173/
```

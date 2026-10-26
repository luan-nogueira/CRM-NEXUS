# Atlas Vendas - Inteligencia Comercial e Gestao de Carteiras

Sistema corporativo de gestao de vendas e inteligencia comercial para equipes de distribuicao, atacado e B2B. A plataforma automatiza o historico de faturamento dos clientes para calcular potencial financeiro, identificar riscos de churn e orientar a rotina comercial diaria.

Acesso em Producao: [https://crm-nexus-phi.vercel.app](https://crm-nexus-phi.vercel.app)

---

## Modulos do Sistema

### 1. Plano do Dia (Workflow Operacional)
- **Fila Sequencial Priorizada**: Algoritmo que ordena o atendimento considerando valor financeiro em aberto (dinheiro na mesa), dias de atraso em relacao ao ciclo medio de recompra e nivel de risco da conta.
- **Painel do Vendedor**: Metricas por cliente (Ciclo Medio, Ultima Compra, Potencial Estimado R$, Desvio de Reposicao).
- **Diagnostico de Atraso**: Indicadores dos motivos de quebra de frequencia do cliente.
- **Acoes de Contato**:
  - **WhatsApp**: Geracao estruturada de proposta e recomendacao de itens com abertura direta de conversa.
  - **Telefone**: Discagem e contato imediato.
  - **Raio-X 360**: Dimensoes cadastrais, historico de faturamento e historico de pedidos.
- **Registro de Desfecho**: Registro do status de atendimento (Ligacao, WhatsApp, Visita, Pedido Fechado, Reagendamento) avancando a fila de forma orientada.

### 2. Inteligencia de Vendas
- **Deteccao de Quedas e Churn**: Identificacao de clientes com declinio de faturamento ou interrupcao no padrao de compras (MoM e YoY).
- **Curva de Recorrencia**: Acompanhamento de lead time de recompra e desvio de estoque previsto.
- **Sugestao de Pedidos**: SKUs sugeridos com base no giro historico e probabilidade de reposicao.

### 3. Comparativo de Desempenho
- Acompanhamento multiperiodo: Mes Atual vs Mes Anterior (M-1) vs Mesmo Mes do Ano Anterior (YoY).
- Comparativo consolidado por carteira, cliente e categorias de produto.

### 4. Expansao de Mix
- Matriz de penetracao de categorias por conta.
- Mapeamento de linhas inativas e projecao de faturamento potencial.

### 5. Redes Economicas e Unidades
- Consolidacao de matrizes, filiais e compradores com visao financeira unificada.

### 6. Temas Corporativos
- **Escuro**: Paleta grafite e preto neutro de alto contraste para ambientes corporativos.
- **Claro**: Estilo minimalista com fundo neutro claro e tipografia solida.

---

## Arquitetura Tecnica

- **Frontend**: React 19, TypeScript
- **Build & Bundler**: Vite
- **Estilos**: Design system em Vanilla CSS com variaveis semanticas
- **Iconografia**: Lucide React
- **Deploy**: Vercel

---

## Execucao Local

1. Clonar o repositorio:
```bash
git clone https://github.com/luan-nogueira/CRM-NEXUS.git
cd CRM-NEXUS
```

2. Instalar dependencias:
```bash
npm install
```

3. Executar o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acessar no navegador:
```
http://localhost:5173
```

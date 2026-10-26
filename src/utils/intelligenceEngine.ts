import type { Client, FilterState, ProductCategoryKey } from '../types/crm';

export const CATEGORIES_CONFIG = [
  { key: 'dryGoods' as ProductCategoryKey, label: 'Linha Seca', color: '#f59e0b', description: 'Farinhas, Grãos, Óleos, Conservas, Molhos' },
  { key: 'dairyRefrigerated' as ProductCategoryKey, label: 'Refrigerados & Laticínios', color: '#06b6d4', description: 'Queijos, Manteigas, Iogurtes, Embutidos' },
  { key: 'frozen' as ProductCategoryKey, label: 'Congelados', color: '#3b82f6', description: 'Polpas, Hambúrgueres, Pratos Prontos, Batatas' },
  { key: 'beverages' as ProductCategoryKey, label: 'Bebidas', color: '#8b5cf6', description: 'Sucos, Refrigerantes, Águas, Cervejas Artesanais' },
  { key: 'cleaning' as ProductCategoryKey, label: 'Higiene & Limpeza', color: '#10b981', description: 'Detergentes Industriais, Desinfetantes, Descartáveis' },
];

/**
 * Calcula a pontuação de prioridade no algoritmo comercial:
 * Pondera:
 * 1. Dinheiro na Mesa / Potencial estimado (40%)
 * 2. Dias de Atraso vs Ciclo Médio (35%)
 * 3. Gravidade da Queda de Faturamento / Risco de Churn (25%)
 */
export function calculatePriorityScore(client: Partial<Client>): number {
  const overdueRatio = client.averageCycleDays && client.daysWithoutPurchase
    ? client.daysWithoutPurchase / client.averageCycleDays
    : 1;

  // Normalized money potential up to R$ 50.000
  const moneyWeight = Math.min((client.estimatedPotentialMonthly || 0) / 40000, 1) * 40;
  
  // Overdue weight: 1.0 = on time (10 pts), > 1.5 = late (25 pts), > 2.5 = critical (35 pts)
  const overdueWeight = Math.min(Math.max((overdueRatio - 0.7) * 20, 0), 35);
  
  // Churn risk weight
  let churnWeight = 0;
  if (client.churnRisk === 'critical') churnWeight = 25;
  else if (client.churnRisk === 'high') churnWeight = 18;
  else if (client.churnRisk === 'moderate') churnWeight = 10;
  else churnWeight = 3;

  return Math.round(moneyWeight + overdueWeight + churnWeight);
}

/**
 * Gera mensagem inteligente personalizada para WhatsApp com base na reposição e mix
 */
export function generateWhatsAppPitch(client: Client): string {
  const buyerGreeting = client.buyerName ? `Olá, ${client.buyerName.split(' ')[0]}!` : 'Olá!';
  const topProducts = client.suggestedOrder.slice(0, 3).map(p => `• ${p.suggestedQty}x ${p.name} (${p.unit})`).join('\n');
  const missingCategories = client.mixPenetration.filter(m => !m.active).map(m => m.label);

  let message = `${buyerGreeting} Tudo bem? Aqui é o ${client.sellerName}.\n\n`;
  message += `Estava analisando o histórico do *${client.tradeName}* e percebi que já fazem *${client.daysWithoutPurchase} dias* desde a sua última reposição (seu ciclo médio é de ${client.averageCycleDays} dias).\n\n`;
  
  if (client.suggestedOrder.length > 0) {
    message += `Com base no seu giro habitual, separei os itens prioritários para não faltar no seu estoque:\n\n${topProducts}\n\n`;
  }

  if (missingCategories.length > 0 && Math.random() > 0.4) {
    message += `💡 Também estamos com uma condição excelente na nossa linha de *${missingCategories[0]}*, que você ainda não testou na loja.\n\n`;
  }

  message += `Conseguimos faturar com entrega expressa para você amanhã. Posso emitir o pedido?`;

  return message;
}

/**
 * Filtro avançado da Carteira e do Plano do Dia
 */
export function filterClients(clients: Client[], filters: FilterState): Client[] {
  return clients.filter(client => {
    // 1. Busca textual (Nome, Fantasia, CNPJ, Cidade, Grupo Econômico)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = client.name.toLowerCase().includes(q);
      const matchTrade = client.tradeName.toLowerCase().includes(q);
      const matchCnpj = client.cnpj.toLowerCase().includes(q);
      const matchCity = client.city.toLowerCase().includes(q);
      const matchGroup = client.economicGroup.toLowerCase().includes(q);
      const matchBuyer = client.buyerName.toLowerCase().includes(q);
      if (!matchName && !matchTrade && !matchCnpj && !matchCity && !matchGroup && !matchBuyer) {
        return false;
      }
    }

    // 2. Data de Corte / Dias sem comprar
    if (filters.cutoffDays !== 'all') {
      if (client.daysWithoutPurchase < filters.cutoffDays) {
        return false;
      }
    }

    // 3. Vendedor
    if (filters.seller !== 'all') {
      if (client.sellerName !== filters.seller && client.sellerId !== filters.seller) {
        return false;
      }
    }

    // 4. Rede Econômica / Agrupamento
    if (filters.economicGroup !== 'all') {
      if (client.economicGroup !== filters.economicGroup) {
        return false;
      }
    }

    // 5. Categoria de Produto
    if (filters.category !== 'all') {
      // Cliente compra ou tem potencial nessa categoria
      const cat = client.mixPenetration.find(m => m.key === filters.category);
      if (!cat || (!cat.active && cat.potential === 0)) {
        return false;
      }
    }

    // 6. Status da Carteira
    if (filters.status !== 'all') {
      if (client.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Formata valores em Reais (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formata valores com decimais
 */
export function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value);
}

/**
 * Formata percentual
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

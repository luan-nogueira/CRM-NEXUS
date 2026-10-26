import React, { useState } from 'react';
import { 
  TrendingDown, 
  Clock, 
  Sparkles, 
  ArrowDownRight, 
  AlertTriangle, 
  ShoppingCart, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import type { Client } from '../types/crm';
import { formatCurrency, formatPercent } from '../utils/intelligenceEngine';

interface SalesIntelligenceViewProps {
  clients: Client[];
  onSelectClientForAction: (client: Client) => void;
  onOpenWhatsApp: (client: Client) => void;
  onOpenNewOrder: (client: Client) => void;
}

export const SalesIntelligenceView: React.FC<SalesIntelligenceViewProps> = ({
  clients,
  onSelectClientForAction,
  onOpenWhatsApp,
  onOpenNewOrder
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'churn' | 'recurrence' | 'suggestions'>('churn');

  // 1. Detecção de Quedas: Clientes com faturamento em queda MoM ou YoY
  const clientsWithDrop = [...clients]
    .filter(c => c.dropPercentageMoM < -15 || c.dropPercentageYoY < -15 || c.status === 'churn_risk')
    .sort((a, b) => a.dropPercentageMoM - b.dropPercentageMoM);

  // 2. Análise de Recorrência: Mapeamento de atraso de recompra
  const recurrenceAnalysis = {
    onTime: clients.filter(c => c.status === 'active'),
    inWindow: clients.filter(c => c.status === 'in_window'),
    overdue: clients.filter(c => c.status === 'overdue'),
    critical: clients.filter(c => c.status === 'churn_risk' || c.status === 'inactive'),
  };

  // 3. Sugestão de Pedidos: Ranking de oportunidades prontas para faturamento
  const highProbabilityProducts = clients.flatMap(client => 
    client.suggestedOrder.map(item => ({
      ...item,
      client,
      totalValue: item.suggestedQty * item.lastPrice
    }))
  ).sort((a, b) => b.totalValue - a.totalValue);

  return (
    <div className="intelligence-view">
      {/* Sub-tab navigation */}
      <div className="intelligence-subnav glass-panel">
        <button 
          className={`subnav-btn ${activeSubTab === 'churn' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('churn')}
        >
          <TrendingDown size={18} />
          <span>Detecção de Quedas & Churn</span>
          <span className="badge badge-rose">{clientsWithDrop.length} alertas</span>
        </button>

        <button 
          className={`subnav-btn ${activeSubTab === 'recurrence' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('recurrence')}
        >
          <Clock size={18} />
          <span>Análise de Recorrência & Ciclo de Recompra</span>
          <span className="badge badge-amber">{recurrenceAnalysis.overdue.length + recurrenceAnalysis.critical.length} atrasados</span>
        </button>

        <button 
          className={`subnav-btn ${activeSubTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('suggestions')}
        >
          <Sparkles size={18} />
          <span>Sugestão de Pedidos Inteligente</span>
          <span className="badge badge-emerald">{highProbabilityProducts.length} itens mapeados</span>
        </button>
      </div>

      {/* TAB 1: DETECÇÃO DE QUEDAS (CHURN DETECTION) */}
      {activeSubTab === 'churn' && (
        <div className="tab-pane animate-fade-in">
          <div className="intelligence-banner alert-critical glass-panel">
            <div className="banner-icon">
              <AlertTriangle size={24} className="text-rose" />
            </div>
            <div>
              <h3>Detecção Automática de Queda de Volume e Faturamento</h3>
              <p>
                O sistema monitora em tempo real a oscilação do faturamento e da frequência de compras, 
                detectando perdas antes que o cliente mude de fornecedor.
              </p>
            </div>
          </div>

          <div className="churn-grid">
            {clientsWithDrop.map(client => (
              <div key={client.id} className="churn-card glass-panel">
                <div className="churn-card-top">
                  <div>
                    <div className="churn-risk-badge">
                      <span className={`badge ${client.churnRisk === 'critical' ? 'badge-rose' : 'badge-amber'}`}>
                        {client.churnRisk === 'critical' ? '🔴 Risco Crítico de Churn' : '🟠 Queda Acentuada'}
                      </span>
                      <span className="seller-tag">Vendedor: {client.sellerName}</span>
                    </div>
                    <h4>{client.tradeName}</h4>
                    <span className="churn-city">{client.city}/{client.state} • {client.economicGroup}</span>
                  </div>

                  <div className="churn-drop-metric">
                    <span className="drop-pct text-rose">
                      <ArrowDownRight size={20} />
                      {formatPercent(client.dropPercentageMoM)}
                    </span>
                    <span className="drop-lbl">vs Mês Anterior</span>
                  </div>
                </div>

                <div className="churn-diagnostic">
                  <strong>Causa Identificada pelo Sistema:</strong>
                  <p>{client.churnReason}</p>
                </div>

                <div className="churn-comparison-row">
                  <div className="comp-item">
                    <span className="comp-lbl">Mês Anterior (M-1):</span>
                    <span className="comp-val">{formatCurrency(client.prevMonthSales)}</span>
                  </div>
                  <div className="comp-item">
                    <span className="comp-lbl">Mês Atual:</span>
                    <span className="comp-val text-amber">{formatCurrency(client.currentMonthSales)}</span>
                  </div>
                  <div className="comp-item">
                    <span className="comp-lbl">Mesmo Mês Ano Anterior (YoY):</span>
                    <span className="comp-val">{formatCurrency(client.sameMonthLastYearSales)} ({formatPercent(client.dropPercentageYoY)})</span>
                  </div>
                  <div className="comp-item highlight">
                    <span className="comp-lbl">Dinheiro na Mesa:</span>
                    <span className="comp-val text-emerald">{formatCurrency(client.moneyOnTheTable)}</span>
                  </div>
                </div>

                <div className="churn-card-footer">
                  <span className="churn-days">
                    <Clock size={14} />
                    Última compra há <strong>{client.daysWithoutPurchase} dias</strong> (Ciclo normal: {client.averageCycleDays}d)
                  </span>

                  <div className="churn-actions">
                    <button 
                      onClick={() => onOpenWhatsApp(client)} 
                      className="btn-sm btn-whatsapp"
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp Recuperação</span>
                    </button>
                    <button 
                      onClick={() => onSelectClientForAction(client)} 
                      className="btn-sm btn-primary"
                    >
                      <span>Atender no Plano do Dia</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ANÁLISE DE RECORRÊNCIA (CURVA DE REPOSIÇÃO & LEAD TIME) */}
      {activeSubTab === 'recurrence' && (
        <div className="tab-pane animate-fade-in">
          <div className="recurrence-summary-grid">
            <div className="recurrence-stat-card glass-panel highlight-emerald">
              <span className="stat-label">Em Dia (Dentro do Ciclo)</span>
              <span className="stat-number text-emerald">{recurrenceAnalysis.onTime.length}</span>
              <span className="stat-sub">Estoque abastecido</span>
            </div>

            <div className="recurrence-stat-card glass-panel highlight-cyan">
              <span className="stat-label">Na Janela de Recompra</span>
              <span className="stat-number text-cyan">{recurrenceAnalysis.inWindow.length}</span>
              <span className="stat-sub">Momento ideal para abordagem</span>
            </div>

            <div className="recurrence-stat-card glass-panel highlight-amber">
              <span className="stat-label">Atraso Leve (1 a 15 dias além)</span>
              <span className="stat-number text-amber">{recurrenceAnalysis.overdue.length}</span>
              <span className="stat-sub">Risco de ruptura na loja</span>
            </div>

            <div className="recurrence-stat-card glass-panel highlight-rose">
              <span className="stat-label">Atraso Crítico (&gt; 15 dias além)</span>
              <span className="stat-number text-rose">{recurrenceAnalysis.critical.length}</span>
              <span className="stat-sub">Perda eminente para concorrente</span>
            </div>
          </div>

          <div className="recurrence-table-card glass-panel">
            <div className="table-header-title">
              <h3>Mapa de Recorrência & Ciclo Médio entre Pedidos</h3>
              <p>O algoritmo calcula a frequência exata de compra de cada cliente para prever o esgotamento do estoque.</p>
            </div>

            <table className="rep-table">
              <thead>
                <tr>
                  <th>Cliente / Rede</th>
                  <th>Segmento</th>
                  <th>Ciclo Médio</th>
                  <th>Última Compra</th>
                  <th>Dias sem Comprar</th>
                  <th>Desvio do Ciclo</th>
                  <th>Potencial Estimado</th>
                  <th>Ação Rápida</th>
                </tr>
              </thead>
              <tbody>
                {clients.sort((a, b) => b.daysWithoutPurchase - a.daysWithoutPurchase).map(client => {
                  const deviation = client.daysWithoutPurchase - client.averageCycleDays;
                  const isLate = deviation > 0;

                  return (
                    <tr key={client.id} className={deviation > 15 ? 'row-critical' : deviation > 0 ? 'row-warning' : ''}>
                      <td>
                        <div className="client-cell">
                          <strong>{client.tradeName}</strong>
                          <span className="cell-sub">{client.economicGroup} • {client.city}</span>
                        </div>
                      </td>
                      <td>{client.segment}</td>
                      <td>
                        <strong>{client.averageCycleDays} dias</strong>
                      </td>
                      <td>{new Date(client.lastPurchaseDate).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <span className={`days-pill ${isLate ? 'pill-late' : 'pill-ok'}`}>
                          {client.daysWithoutPurchase} dias
                        </span>
                      </td>
                      <td>
                        {isLate ? (
                          <span className="text-rose font-bold">+{deviation} dias de atraso</span>
                        ) : (
                          <span className="text-emerald font-bold">{Math.abs(deviation)} dias restantes</span>
                        )}
                      </td>
                      <td>
                        <strong className="text-emerald">{formatCurrency(client.estimatedPotentialMonthly)}</strong>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button 
                            onClick={() => onSelectClientForAction(client)}
                            className="btn-action-icon"
                            title="Ir para o Plano do Dia"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUGESTÃO DE PEDIDOS INTELIGENTE (RANKING DE OPORTUNIDADES) */}
      {activeSubTab === 'suggestions' && (
        <div className="tab-pane animate-fade-in">
          <div className="suggestions-intro glass-panel">
            <div className="intro-icon">
              <ShoppingCart size={24} className="text-emerald" />
            </div>
            <div>
              <h3>Recomendações de Produtos Cruzados por Probabilidade</h3>
              <p>
                O sistema analisa os itens mais comprados por cada cliente, calculando a taxa de giro 
                e sugerindo a quantidade exata para o próximo faturamento.
              </p>
            </div>
          </div>

          <div className="suggestions-list-card glass-panel">
            <table className="rep-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Produto Recomendado</th>
                  <th>Categoria</th>
                  <th>Qtd Sugerida</th>
                  <th>Preço Unitário</th>
                  <th>Valor Estimado</th>
                  <th>Prioridade Algorítmica</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {highProbabilityProducts.map((item, idx) => (
                  <tr key={`${item.client.id}-${item.id}-${idx}`}>
                    <td>
                      <div>
                        <strong>{item.client.tradeName}</strong>
                        <span className="cell-sub">{item.client.buyerName}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="prod-name-strong">{item.name}</span>
                        <span className="cell-sub">SKU: {item.sku} • Giro: {item.monthlyRunRate} {item.unit}/mês</span>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{item.categoryLabel}</span>
                    </td>
                    <td>
                      <strong className="text-emerald">{item.suggestedQty} {item.unit}</strong>
                    </td>
                    <td>{formatCurrency(item.lastPrice)}</td>
                    <td>
                      <strong className="text-emerald">{formatCurrency(item.totalValue)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${item.priority === 'essential' ? 'badge-rose' : item.priority === 'recurrence' ? 'badge-amber' : 'badge-indigo'}`}>
                        {item.priority === 'essential' ? 'Essencial (Ruptura)' : item.priority === 'recurrence' ? 'Reposição de Ciclo' : 'Expansão de Mix'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-row">
                        <button 
                          onClick={() => onOpenWhatsApp(item.client)}
                          className="btn-table-icon"
                          title="Enviar oferta via WhatsApp"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button 
                          onClick={() => onOpenNewOrder(item.client)}
                          className="btn-table-icon btn-table-order"
                          title="Lançar pedido com este produto"
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

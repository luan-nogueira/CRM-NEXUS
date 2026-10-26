import React, { useState } from 'react';
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  Calendar, 
  AlertCircle, 
  ShoppingCart, 
  Eye, 
  Flame,
  ArrowRight,
  TrendingDown,
  Building2,
  UserCheck
} from 'lucide-react';
import type { Client, InteractionLog } from '../types/crm';
import { formatCurrency } from '../utils/intelligenceEngine';

interface DailyPlanViewProps {
  clients: Client[];
  activeClient: Client | null;
  setActiveClient: (client: Client) => void;
  onOpenWhatsApp: (client: Client) => void;
  onOpenNewOrder: (client: Client) => void;
  onOpenClientDetail: (client: Client) => void;
  onLogInteraction: (clientId: string, type: InteractionLog['type'], notes: string, orderValue?: number) => void;
}

export const DailyPlanView: React.FC<DailyPlanViewProps> = ({
  clients,
  activeClient,
  setActiveClient,
  onOpenWhatsApp,
  onOpenNewOrder,
  onOpenClientDetail,
  onLogInteraction
}) => {
  const [quickNote, setQuickNote] = useState('');

  // Sort queue by priority score descending (Dinheiro na mesa + urgência de reposição)
  const queueClients = [...clients].sort((a, b) => b.priorityScore - a.priorityScore);

  const currentIndex = activeClient 
    ? queueClients.findIndex(c => c.id === activeClient.id) 
    : 0;

  const currentClient = activeClient || queueClients[0] || null;

  const handleNextInQueue = () => {
    if (queueClients.length === 0) return;
    const nextIndex = (currentIndex + 1) % queueClients.length;
    setActiveClient(queueClients[nextIndex]);
    setQuickNote('');
  };

  const handleRegisterContact = (type: InteractionLog['type'], defaultNote: string) => {
    if (!currentClient) return;
    const note = quickNote.trim() || defaultNote;
    onLogInteraction(currentClient.id, type, note);
    setQuickNote('');
    handleNextInQueue();
  };

  if (queueClients.length === 0) {
    return (
      <div className="empty-state glass-panel">
        <Sparkles size={48} className="text-emerald" />
        <h3>Nenhum cliente pendente com os filtros selecionados</h3>
        <p>Ajuste os filtros de data de corte ou categoria para carregar mais atendimentos.</p>
      </div>
    );
  }

  const getStatusBadge = (status: Client['status']) => {
    switch(status) {
      case 'churn_risk':
        return <span className="badge badge-rose"><TrendingDown size={12} /> Risco de Queda</span>;
      case 'overdue':
        return <span className="badge badge-amber"><Clock size={12} /> Atrasado</span>;
      case 'in_window':
        return <span className="badge badge-cyan"><Calendar size={12} /> Na Janela</span>;
      case 'inactive':
        return <span className="badge badge-rose"><AlertCircle size={12} /> Inativo</span>;
      default:
        return <span className="badge badge-emerald"><CheckCircle size={12} /> Em Dia</span>;
    }
  };

  return (
    <div className="daily-plan-grid">
      {/* LEFT COLUMN: Fila Ranqueada de Atendimento (Priorização Inteligente) */}
      <div className="queue-column glass-panel">
        <div className="queue-header">
          <div>
            <h3 className="queue-title">Fila de Atendimento Priorizada</h3>
            <span className="queue-subtitle">
              Classificação algorítmica por urgência e dinheiro na mesa
            </span>
          </div>
          <div className="queue-badge-count">
            {currentIndex + 1} de {queueClients.length}
          </div>
        </div>

        <div className="queue-list">
          {queueClients.map((client, index) => {
            const isSelected = currentClient?.id === client.id;
            const hasOverdue = client.daysWithoutPurchase > client.averageCycleDays;

            return (
              <div 
                key={client.id}
                onClick={() => {
                  setActiveClient(client);
                  setQuickNote('');
                }}
                className={`queue-card ${isSelected ? 'active' : ''}`}
              >
                <div className="card-top-row">
                  <div className="rank-indicator">
                    <span className="rank-num">#{index + 1}</span>
                    <span className="score-pts">{client.priorityScore} pts</span>
                  </div>
                  {getStatusBadge(client.status)}
                </div>

                <div className="card-client-name">
                  <h4>{client.tradeName}</h4>
                  <span className="client-network-tag">
                    {client.economicGroup !== 'Avulso' ? `🏢 ${client.economicGroup}` : `📍 ${client.city}/${client.state}`}
                  </span>
                </div>

                <div className="card-metrics-grid">
                  <div className="mini-metric">
                    <span className="m-label">Última compra:</span>
                    <span className={`m-val ${hasOverdue ? 'text-amber' : ''}`}>
                      {client.daysWithoutPurchase}d atrás
                    </span>
                  </div>
                  <div className="mini-metric">
                    <span className="m-label">Potencial Mensal:</span>
                    <span className="m-val text-emerald">
                      {formatCurrency(client.estimatedPotentialMonthly)}
                    </span>
                  </div>
                </div>

                {client.moneyOnTheTable > 0 && (
                  <div className="card-money-bar">
                    <span className="money-label">Dinheiro na mesa:</span>
                    <span className="money-val">{formatCurrency(client.moneyOnTheTable)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Foco do Vendedor (Workspace Ativo de Atendimento) */}
      {currentClient && (
        <div className="focus-column glass-panel">
          {/* Active Client Stepper Top Header */}
          <div className="focus-header">
            <div className="focus-client-info">
              <div className="client-title-row">
                <h2>{currentClient.tradeName}</h2>
                <span className="client-official-name">({currentClient.name})</span>
                {getStatusBadge(currentClient.status)}
              </div>
              
              <div className="client-meta-row">
                <span className="meta-item">
                  <Building2 size={14} className="text-cyan" />
                  <strong>CNPJ:</strong> {currentClient.cnpj}
                </span>
                <span className="meta-item">
                  <strong>Segmento:</strong> {currentClient.segment}
                </span>
                <span className="meta-item">
                  <strong>Rede:</strong> {currentClient.economicGroup} {currentClient.isMatrix ? '(Matriz)' : '(Filial)'}
                </span>
                <span className="meta-item">
                  <strong>Vendedor:</strong> {currentClient.sellerName}
                </span>
              </div>
            </div>

            <div className="focus-actions-top">
              <button 
                onClick={() => onOpenClientDetail(currentClient)} 
                className="btn-secondary"
                title="Ver Raio-X 360 do Cliente"
              >
                <Eye size={16} />
                <span>Raio-X 360°</span>
              </button>
              
              <button 
                onClick={handleNextInQueue} 
                className="btn-secondary"
                title="Pular para o próximo cliente"
              >
                <span>Próximo</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Alert Diagnostic Box */}
          <div className={`diagnosis-alert ${currentClient.churnRisk === 'critical' || currentClient.churnRisk === 'high' ? 'alert-critical' : 'alert-warning'}`}>
            <div className="diagnosis-icon">
              {currentClient.churnRisk === 'critical' ? <Flame size={20} className="text-rose" /> : <AlertCircle size={20} className="text-amber" />}
            </div>
            <div className="diagnosis-body">
              <strong>Diagnóstico de Inteligência Comercial:</strong>
              <p>{currentClient.churnReason}</p>
            </div>
          </div>

          {/* Calculated Operational KPIs */}
          <div className="stepper-kpi-grid">
            <div className="stepper-kpi">
              <span className="kpi-title">Data da Última Compra</span>
              <span className="kpi-number text-amber">
                {new Date(currentClient.lastPurchaseDate).toLocaleDateString('pt-BR')}
              </span>
              <span className="kpi-desc">
                Há <strong>{currentClient.daysWithoutPurchase} dias</strong> ({currentClient.overdueDays > 0 ? `${currentClient.overdueDays}d além do ciclo` : 'dentro do ciclo'})
              </span>
            </div>

            <div className="stepper-kpi">
              <span className="kpi-title">Ciclo Médio de Recompra</span>
              <span className="kpi-number">
                {currentClient.averageCycleDays} dias
              </span>
              <span className="kpi-desc">Tempo padrão entre reposições</span>
            </div>

            <div className="stepper-kpi">
              <span className="kpi-title">Potencial Estimado (Mês)</span>
              <span className="kpi-number text-emerald">
                {formatCurrency(currentClient.estimatedPotentialMonthly)}
              </span>
              <span className="kpi-desc">Faturamento real recorrente</span>
            </div>

            <div className="stepper-kpi">
              <span className="kpi-title">Dinheiro na Mesa</span>
              <span className="kpi-number text-amber">
                {formatCurrency(currentClient.moneyOnTheTable)}
              </span>
              <span className="kpi-desc">Previsão pendente para reposição</span>
            </div>
          </div>

          {/* Buyer Contact Card & Instant Triggers */}
          <div className="buyer-contact-card">
            <div className="buyer-profile">
              <div className="buyer-avatar">
                <UserCheck size={20} />
              </div>
              <div className="buyer-details">
                <span className="buyer-name">{currentClient.buyerName}</span>
                <span className="buyer-role">{currentClient.buyerRole} • {currentClient.city}/{currentClient.state}</span>
              </div>
            </div>

            <div className="buyer-triggers">
              <button 
                onClick={() => onOpenWhatsApp(currentClient)} 
                className="btn-trigger btn-whatsapp"
                title="Gerar script inteligente para WhatsApp"
              >
                <MessageSquare size={16} />
                <span>WhatsApp Inteligente</span>
              </button>

              <a 
                href={`tel:${currentClient.phone.replace(/\D/g, '')}`} 
                className="btn-trigger btn-phone"
                title="Ligar para o cliente"
              >
                <Phone size={16} />
                <span>Ligar ({currentClient.phone})</span>
              </a>

              <button 
                onClick={() => onOpenNewOrder(currentClient)} 
                className="btn-trigger btn-order-primary"
                title="Lançar pedido com produtos sugeridos"
              >
                <ShoppingCart size={16} />
                <span>Emitir Pedido</span>
              </button>
            </div>
          </div>

          {/* Sugestão de Pedidos (Inteligência de Vendas) */}
          <div className="suggested-order-section">
            <div className="section-title-wrap">
              <div className="title-with-icon">
                <Sparkles size={18} className="text-emerald" />
                <h3>Sugestão de Pedido Inteligente (Baseada no Giro Real)</h3>
              </div>
              <span className="section-hint">Produtos cruzados com o histórico de compra e consumo médio</span>
            </div>

            <div className="suggested-table-wrap">
              <table className="suggested-table">
                <thead>
                  <tr>
                    <th>SKU / Produto</th>
                    <th>Linha</th>
                    <th>Giro Médio</th>
                    <th>Qtd Sugerida</th>
                    <th>Último Preço</th>
                    <th>Total Sugerido</th>
                    <th>Motivo da Recomendação</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClient.suggestedOrder.map((item) => (
                    <tr key={item.id} className={item.priority === 'essential' ? 'row-essential' : ''}>
                      <td>
                        <div className="prod-cell">
                          <span className="prod-name">{item.name}</span>
                          <span className="prod-sku">{item.sku}</span>
                        </div>
                      </td>
                      <td>
                        <span className="category-pill">{item.categoryLabel}</span>
                      </td>
                      <td>{item.monthlyRunRate} {item.unit}/mês</td>
                      <td>
                        <strong className="text-emerald">{item.suggestedQty} {item.unit}</strong>
                      </td>
                      <td>{formatCurrency(item.lastPrice)}</td>
                      <td>
                        <strong>{formatCurrency(item.suggestedQty * item.lastPrice)}</strong>
                      </td>
                      <td>
                        <span className="recommendation-badge">
                          {item.reason}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stepper Execution: Registrar Resultado do Contato e Avançar */}
          <div className="interaction-stepper-footer">
            <div className="stepper-prompt">
              <span className="stepper-label">Registrar resultado do atendimento:</span>
              <input 
                type="text" 
                placeholder="Observação rápida do contato (ex: pediu para faturar 80 caixas de óleo na quinta-feira)..." 
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="quick-note-input"
              />
            </div>

            <div className="stepper-buttons">
              <button 
                onClick={() => handleRegisterContact('call', 'Ligação realizada com o comprador.')}
                className="btn-outcome btn-outcome-call"
              >
                <Phone size={15} />
                <span>Ligação Concluída</span>
              </button>

              <button 
                onClick={() => handleRegisterContact('whatsapp', 'Mensagem enviada via WhatsApp.')}
                className="btn-outcome btn-outcome-wa"
              >
                <MessageSquare size={15} />
                <span>WhatsApp Enviado</span>
              </button>

              <button 
                onClick={() => onOpenNewOrder(currentClient)}
                className="btn-outcome btn-outcome-deal"
              >
                <CheckCircle size={15} />
                <span>Pedido Fechado 🎉</span>
              </button>

              <button 
                onClick={() => handleRegisterContact('rescheduled', 'Cliente pediu retorno em outra data.')}
                className="btn-outcome btn-outcome-reschedule"
              >
                <Clock size={15} />
                <span>Reagendar</span>
              </button>

              <button 
                onClick={handleNextInQueue}
                className="btn-outcome btn-outcome-skip"
              >
                <span>Pular / Próximo</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

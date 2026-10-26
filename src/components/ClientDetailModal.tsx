import React from 'react';
import { 
  UserCheck, 
  Clock, 
  DollarSign, 
  ShoppingCart, 
  MessageSquare, 
  X, 
  History
} from 'lucide-react';
import type { Client } from '../types/crm';
import { formatCurrency, formatPercent } from '../utils/intelligenceEngine';

interface ClientDetailModalProps {
  client: Client | null;
  onClose: () => void;
  onOpenWhatsApp: (client: Client) => void;
  onOpenNewOrder: (client: Client) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onOpenWhatsApp,
  onOpenNewOrder
}) => {
  if (!client) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box modal-xl glass-panel animate-fade-in">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="badge-360">Raio-X 360°</div>
            <div>
              <h3>{client.tradeName}</h3>
              <span className="modal-sub">
                Razão Social: <strong>{client.name}</strong> • CNPJ: {client.cnpj}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Top Info Grid */}
          <div className="detail-info-grid">
            <div className="detail-card glass-panel">
              <span className="detail-card-title">
                <UserCheck size={16} className="text-cyan" />
                Dados do Comprador & Localização
              </span>
              <div className="detail-list">
                <div className="d-row">
                  <span className="d-label">Comprador:</span>
                  <span className="d-val">{client.buyerName} ({client.buyerRole})</span>
                </div>
                <div className="d-row">
                  <span className="d-label">Telefone:</span>
                  <span className="d-val">{client.phone}</span>
                </div>
                <div className="d-row">
                  <span className="d-label">WhatsApp:</span>
                  <span className="d-val">{client.whatsapp}</span>
                </div>
                <div className="d-row">
                  <span className="d-label">Localização:</span>
                  <span className="d-val">{client.city}/{client.state}</span>
                </div>
                <div className="d-row">
                  <span className="d-label">Rede / Grupo:</span>
                  <span className="d-val font-semibold text-cyan">{client.economicGroup}</span>
                </div>
              </div>
            </div>

            <div className="detail-card glass-panel">
              <span className="detail-card-title">
                <DollarSign size={16} className="text-emerald" />
                Inteligência Financeira Real
              </span>
              <div className="detail-list">
                <div className="d-row">
                  <span className="d-label">Potencial Estimado Mensal:</span>
                  <span className="d-val text-emerald font-bold">{formatCurrency(client.estimatedPotentialMonthly)}</span>
                </div>
                <div className="d-row">
                  <span className="d-label">Faturamento Mês Atual:</span>
                  <span className="d-val">{formatCurrency(client.currentMonthSales)}</span>
                </div>
                <div className="d-row">
                  <span className="d-label">Faturamento Mês Anterior (M-1):</span>
                  <span className="d-val">{formatCurrency(client.prevMonthSales)} ({formatPercent(client.dropPercentageMoM)})</span>
                </div>
                <div className="d-row">
                  <span className="d-label">Mesmo Mês Ano Passado (YoY):</span>
                  <span className="d-val">{formatCurrency(client.sameMonthLastYearSales)} ({formatPercent(client.dropPercentageYoY)})</span>
                </div>
                <div className="d-row">
                  <span className="d-label">Dinheiro na Mesa:</span>
                  <span className="d-val text-amber font-bold">{formatCurrency(client.moneyOnTheTable)}</span>
                </div>
              </div>
            </div>

            <div className="detail-card glass-panel">
              <span className="detail-card-title">
                <Clock size={16} className="text-amber" />
                Ciclo de Recompra & Prazos
              </span>
              <div className="detail-list">
                <div className="d-row">
                  <span className="d-label">Última Compra:</span>
                  <span className="d-val font-bold text-amber">
                    {new Date(client.lastPurchaseDate).toLocaleDateString('pt-BR')} ({client.daysWithoutPurchase} dias atrás)
                  </span>
                </div>
                <div className="d-row">
                  <span className="d-label">Ciclo Médio entre Pedidos:</span>
                  <span className="d-val">{client.averageCycleDays} dias</span>
                </div>
                <div className="d-row">
                  <span className="d-label">Desvio de Reposição:</span>
                  <span className={`d-val font-bold ${client.overdueDays > 0 ? 'text-rose' : 'text-emerald'}`}>
                    {client.overdueDays > 0 ? `+${client.overdueDays} dias de atraso` : 'Dentro do ciclo normal'}
                  </span>
                </div>
                <div className="d-row">
                  <span className="d-label">Vendedor Responsável:</span>
                  <span className="d-val">{client.sellerName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Mix Matrix */}
          <div className="detail-section glass-panel">
            <h4>Penetração de Mix de Produtos por Categoria</h4>
            <div className="mix-matrix-grid">
              {client.mixPenetration.map(m => (
                <div key={m.key} className={`mix-matrix-card ${m.active ? 'active' : 'inactive'}`}>
                  <div className="mm-header">
                    <span className="mm-name">{m.label}</span>
                    <span className={`badge ${m.active ? 'badge-emerald' : 'badge-gray'}`}>
                      {m.active ? 'Ativa' : 'Não Ativada'}
                    </span>
                  </div>
                  <div className="mm-values">
                    <span>Média Mensal: <strong>{formatCurrency(m.monthlyAvg)}</strong></span>
                    <span>Potencial Estimado: <strong>{formatCurrency(m.potential)}</strong></span>
                  </div>
                  {m.gapReason && (
                    <p className="mm-gap">Nota: {m.gapReason}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders History & Interaction Logs */}
          <div className="detail-split-tables">
            <div className="split-table-box glass-panel">
              <h4>
                <ShoppingCart size={16} className="text-emerald" />
                Últimos Pedidos Faturados
              </h4>
              <table className="rep-table">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Itens</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {client.recentOrders.map(ord => (
                    <tr key={ord.id}>
                      <td><strong>{ord.orderNumber}</strong></td>
                      <td>{new Date(ord.date).toLocaleDateString('pt-BR')}</td>
                      <td className="text-emerald"><strong>{formatCurrency(ord.total)}</strong></td>
                      <td>{ord.itemsCount} itens</td>
                      <td><span className="badge badge-emerald">{ord.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="split-table-box glass-panel">
              <h4>
                <History size={16} className="text-cyan" />
                Histórico de Interações Comerciais
              </h4>
              {client.interactionLogs.length === 0 ? (
                <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>Nenhum contato registrado ainda hoje.</p>
              ) : (
                <div className="logs-list">
                  {client.interactionLogs.map(log => (
                    <div key={log.id} className="log-item">
                      <div className="log-top">
                        <span className="badge badge-indigo">{log.type.toUpperCase()}</span>
                        <span className="log-date">{log.date} • {log.sellerName}</span>
                      </div>
                      <p className="log-notes">{log.notes}</p>
                      {log.orderValue && (
                        <span className="log-deal text-emerald">Pedido associado: {formatCurrency(log.orderValue)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            onClick={() => {
              onClose();
              onOpenWhatsApp(client);
            }} 
            className="btn-secondary"
          >
            <MessageSquare size={16} />
            <span>WhatsApp Inteligente</span>
          </button>

          <button 
            onClick={() => {
              onClose();
              onOpenNewOrder(client);
            }} 
            className="btn-primary"
          >
            <ShoppingCart size={16} />
            <span>Emitir Pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};

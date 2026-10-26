import { 
  Network, 
  Eye, 
  MessageSquare
} from 'lucide-react';
import type { Client } from '../types/crm';
import { formatCurrency } from '../utils/intelligenceEngine';

interface ClientsListViewProps {
  clients: Client[];
  onSelectClientForAction: (client: Client) => void;
  onOpenClientDetail: (client: Client) => void;
  onOpenWhatsApp: (client: Client) => void;
  onOpenNewOrder?: (client: Client) => void;
}

export const ClientsListView: React.FC<ClientsListViewProps> = ({
  clients,
  onSelectClientForAction,
  onOpenClientDetail,
  onOpenWhatsApp
}) => {
  // Group by Economic Group
  const groups: { [key: string]: Client[] } = {};
  clients.forEach(c => {
    const g = c.economicGroup || 'Avulso';
    if (!groups[g]) groups[g] = [];
    groups[g].push(c);
  });

  return (
    <div className="clients-list-view animate-fade-in">
      <div className="wallet-header glass-panel">
        <div>
          <h2>Carteira de Clientes & Redes Econômicas</h2>
          <p>Visão integrada de grupos comerciais, filiais e histórico consolidado por comprador.</p>
        </div>
        <div className="wallet-count-badge">
          {clients.length} contas cadastradas
        </div>
      </div>

      <div className="groups-container">
        {Object.entries(groups).map(([groupName, groupClients]) => {
          const groupPotential = groupClients.reduce((acc, c) => acc + c.estimatedPotentialMonthly, 0);
          const groupMoneyOnTable = groupClients.reduce((acc, c) => acc + c.moneyOnTheTable, 0);

          return (
            <div key={groupName} className="group-card glass-panel">
              <div className="group-card-header">
                <div className="group-title-wrap">
                  <div className="network-icon">
                    <Network size={20} className="text-cyan" />
                  </div>
                  <div>
                    <h3>{groupName}</h3>
                    <span className="group-subtitle">
                      {groupClients.length} {groupClients.length === 1 ? 'loja / unidade' : 'lojas / unidades no grupo'}
                    </span>
                  </div>
                </div>

                <div className="group-financials">
                  <div className="gf-item">
                    <span className="gf-label">Potencial Mensal do Grupo:</span>
                    <span className="gf-value text-emerald">{formatCurrency(groupPotential)}</span>
                  </div>
                  <div className="gf-item">
                    <span className="gf-label">Dinheiro na Mesa:</span>
                    <span className="gf-value text-amber">{formatCurrency(groupMoneyOnTable)}</span>
                  </div>
                </div>
              </div>

              <div className="group-clients-table-wrap">
                <table className="rep-table">
                  <thead>
                    <tr>
                      <th>Unidade / Razão Social</th>
                      <th>CNPJ</th>
                      <th>Cidade / UF</th>
                      <th>Comprador</th>
                      <th>Última Compra</th>
                      <th>Potencial (R$)</th>
                      <th>Status da Carteira</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupClients.map(client => (
                      <tr key={client.id}>
                        <td>
                          <div>
                            <div className="unit-name-row">
                              <strong>{client.tradeName}</strong>
                              {client.isMatrix && <span className="matrix-badge">Matriz</span>}
                            </div>
                            <span className="cell-sub">{client.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="mono-code">{client.cnpj}</span>
                        </td>
                        <td>{client.city}/{client.state}</td>
                        <td>
                          <div>
                            <span>{client.buyerName}</span>
                            <span className="cell-sub">{client.buyerRole}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span>{new Date(client.lastPurchaseDate).toLocaleDateString('pt-BR')}</span>
                            <span className="cell-sub">{client.daysWithoutPurchase}d atrás</span>
                          </div>
                        </td>
                        <td>
                          <strong className="text-emerald">{formatCurrency(client.estimatedPotentialMonthly)}</strong>
                        </td>
                        <td>
                          <span className={`badge ${client.status === 'churn_risk' ? 'badge-rose' : client.status === 'overdue' ? 'badge-amber' : client.status === 'in_window' ? 'badge-cyan' : 'badge-emerald'}`}>
                            {client.status === 'churn_risk' ? 'Risco de Churn' : client.status === 'overdue' ? 'Atrasado' : client.status === 'in_window' ? 'Na Janela' : 'Em Dia'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-row">
                            <button 
                              onClick={() => onOpenClientDetail(client)}
                              className="btn-table-icon"
                              title="Visualizar Raio-X 360"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              onClick={() => onOpenWhatsApp(client)}
                              className="btn-table-icon"
                              title="WhatsApp Inteligente"
                            >
                              <MessageSquare size={15} />
                            </button>
                            <button 
                              onClick={() => onSelectClientForAction(client)}
                              className="btn-sm btn-primary"
                              title="Atender no Plano do Dia"
                            >
                              Atender
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

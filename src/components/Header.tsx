import React from 'react';
import { 
  Compass, 
  CalendarCheck, 
  TrendingDown, 
  BarChart3, 
  Layers, 
  Users, 
  Search, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import type { Client, DailyQueueProgress, AppTheme } from '../types/crm';
import { formatCurrency } from '../utils/intelligenceEngine';

interface HeaderProps {
  activeTab: 'daily-plan' | 'intelligence' | 'performance' | 'mix' | 'clients';
  setActiveTab: (tab: 'daily-plan' | 'intelligence' | 'performance' | 'mix' | 'clients') => void;
  selectedSeller: string;
  setSelectedSeller: (seller: string) => void;
  sellers: { id: string; name: string }[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clients: Client[];
  queueProgress: DailyQueueProgress;
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedSeller,
  setSelectedSeller,
  sellers,
  searchQuery,
  setSearchQuery,
  clients,
  queueProgress,
  currentTheme,
  onSelectTheme
}) => {
  const filteredClients = selectedSeller === 'all'
    ? clients
    : clients.filter(c => c.sellerId === selectedSeller || c.sellerName === selectedSeller);

  const totalPotential = filteredClients.reduce((acc, c) => acc + c.estimatedPotentialMonthly, 0);
  const moneyOnTheTable = filteredClients.reduce((acc, c) => acc + c.moneyOnTheTable, 0);
  const atRiskCount = filteredClients.filter(c => c.status === 'churn_risk' || c.status === 'overdue').length;

  return (
    <header className="header-container glass-panel">
      {/* Top Branding & Meta Bar */}
      <div className="header-top">
        <div className="brand-group">
          <div className="brand-icon">
            <Compass size={22} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <span className="brand-title">ATLAS</span>
              <span className="brand-badge">VENDAS</span>
            </div>
            <p className="brand-subtitle">Gestão de Workflow e Inteligência Comercial</p>
          </div>
        </div>

        {/* Global Search, Seller & Theme Selector */}
        <div className="header-actions">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar cliente, CNPJ ou comprador..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear">×</button>
            )}
          </div>

          <div className="seller-selector-wrap">
            <label className="seller-label">Vendedor:</label>
            <select 
              value={selectedSeller} 
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="seller-select"
            >
              <option value="all">Equipe Completa ({clients.length} contas)</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="theme-selector-wrap">
            <SlidersHorizontal size={14} className="theme-icon" />
            <label className="theme-label">Tema:</label>
            <select 
              value={currentTheme}
              onChange={(e) => onSelectTheme(e.target.value as AppTheme)}
              className="theme-select"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Commercial KPI Ribbon */}
      <div className="kpi-ribbon">
        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <DollarSign size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Potencial da Carteira</span>
            <span className="kpi-value">{formatCurrency(totalPotential)}</span>
            <span className="kpi-sub">Faturamento recorrente</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Dinheiro na Mesa</span>
            <span className="kpi-value">{formatCurrency(moneyOnTheTable)}</span>
            <span className="kpi-sub">{atRiskCount} clientes em atraso ou risco</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <CalendarCheck size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Plano do Dia</span>
            <span className="kpi-value">
              {queueProgress.contactedCount} / {filteredClients.length}
            </span>
            <span className="kpi-sub">Contatos realizados hoje</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap">
            <CheckCircle2 size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Vendas Fechadas Hoje</span>
            <span className="kpi-value">{formatCurrency(queueProgress.ordersPlacedTotal)}</span>
            <span className="kpi-sub">{queueProgress.ordersPlacedCount} pedidos confirmados</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="header-nav">
        <button 
          className={`nav-tab ${activeTab === 'daily-plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily-plan')}
        >
          <CalendarCheck size={16} />
          <span>Plano do Dia</span>
          <span className="tab-pill">{filteredClients.length}</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'intelligence' ? 'active' : ''}`}
          onClick={() => setActiveTab('intelligence')}
        >
          <TrendingDown size={16} />
          <span>Inteligência de Vendas</span>
          <span className="tab-pill">{atRiskCount}</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <BarChart3 size={16} />
          <span>Comparativo de Desempenho</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'mix' ? 'active' : ''}`}
          onClick={() => setActiveTab('mix')}
        >
          <Layers size={16} />
          <span>Expansão de Mix</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <Users size={16} />
          <span>Carteira e Redes</span>
        </button>
      </nav>
    </header>
  );
};

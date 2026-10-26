import React from 'react';
import { 
  Sparkles, 
  CalendarCheck, 
  TrendingDown, 
  BarChart3, 
  Layers, 
  Users, 
  Search, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2,
  Palette
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
  // Aggregate KPIs
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
            <Sparkles size={22} className="sparkle-anim" />
          </div>
          <div>
            <div className="brand-title-wrap">
              <span className="brand-title">NEXUS</span>
              <span className="brand-badge">SALES INTELLIGENCE</span>
              <span className="pulse-dot" title="Algoritmo Comercial Ativo"></span>
            </div>
            <p className="brand-subtitle">Gestão de Workflow & Inteligência Comercial Baseada em Dados</p>
          </div>
        </div>

        {/* Global Search & Seller Selector */}
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar cliente, CNPJ, rede ou comprador..." 
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
              <option value="all">Equipe Completa ({clients.length} clientes)</option>
              {sellers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="theme-selector-wrap" title="Alterar Tema Visual">
            <Palette size={15} className="theme-icon text-cyan" />
            <label className="theme-label">Tema:</label>
            <select 
              value={currentTheme}
              onChange={(e) => onSelectTheme(e.target.value as AppTheme)}
              className="theme-select"
            >
              <option value="dark">🌙 Dark Slate</option>
              <option value="light">☀️ Light Clean</option>
              <option value="navy">🌊 Royal Navy</option>
              <option value="gold">👑 Obsidian Gold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Commercial KPI Ribbon */}
      <div className="kpi-ribbon">
        <div className="kpi-card highlight-emerald">
          <div className="kpi-icon-wrap emerald">
            <DollarSign size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Potencial da Carteira</span>
            <span className="kpi-value">{formatCurrency(totalPotential)}</span>
            <span className="kpi-sub">Faturamento real recorrente</span>
          </div>
        </div>

        <div className="kpi-card highlight-amber">
          <div className="kpi-icon-wrap amber">
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Dinheiro na Mesa</span>
            <span className="kpi-value text-amber">{formatCurrency(moneyOnTheTable)}</span>
            <span className="kpi-sub">{atRiskCount} clientes em atraso / risco</span>
          </div>
        </div>

        <div className="kpi-card highlight-cyan">
          <div className="kpi-icon-wrap cyan">
            <CalendarCheck size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Plano do Dia</span>
            <span className="kpi-value">
              {queueProgress.contactedCount} / {filteredClients.length}
            </span>
            <span className="kpi-sub">Contatos executados hoje</span>
          </div>
        </div>

        <div className="kpi-card highlight-indigo">
          <div className="kpi-icon-wrap indigo">
            <CheckCircle2 size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Vendas Fechadas Hoje</span>
            <span className="kpi-value text-emerald">{formatCurrency(queueProgress.ordersPlacedTotal)}</span>
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
          <CalendarCheck size={18} />
          <span>Plano do Dia (Fila de Atendimento)</span>
          <span className="tab-pill tab-pill-emerald">{filteredClients.length}</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'intelligence' ? 'active' : ''}`}
          onClick={() => setActiveTab('intelligence')}
        >
          <TrendingDown size={18} />
          <span>Inteligência de Vendas (Quedas & Sugestão)</span>
          <span className="tab-pill tab-pill-amber">{atRiskCount} alertas</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <BarChart3 size={18} />
          <span>Comparativo (Mês / M-1 / Ano Anterior)</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'mix' ? 'active' : ''}`}
          onClick={() => setActiveTab('mix')}
        >
          <Layers size={18} />
          <span>Expansão de Mix & Categorias</span>
        </button>

        <button 
          className={`nav-tab ${activeTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <Users size={18} />
          <span>Carteira & Redes Econômicas</span>
        </button>
      </nav>
    </header>
  );
};

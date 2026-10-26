import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';
import type { Client } from '../types/crm';
import { formatCurrency, formatPercent, CATEGORIES_CONFIG } from '../utils/intelligenceEngine';

interface PerformanceComparisonViewProps {
  clients: Client[];
  onSelectClientForAction: (client: Client) => void;
}

export const PerformanceComparisonView: React.FC<PerformanceComparisonViewProps> = ({
  clients,
  onSelectClientForAction
}) => {
  const [selectedView, setSelectedView] = useState<'by-client' | 'by-category'>('by-client');

  // Total Metrics across clients
  const currentMonthTotal = clients.reduce((acc, c) => acc + c.currentMonthSales, 0);
  const prevMonthTotal = clients.reduce((acc, c) => acc + c.prevMonthSales, 0);
  const lastYearTotal = clients.reduce((acc, c) => acc + c.sameMonthLastYearSales, 0);

  const diffMoM = prevMonthTotal > 0 ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;
  const diffYoY = lastYearTotal > 0 ? ((currentMonthTotal - lastYearTotal) / lastYearTotal) * 100 : 0;

  // Category Aggregates
  const categoryStats = CATEGORIES_CONFIG.map(cat => {
    let currentCatSales = 0;
    let potentialCatSales = 0;

    clients.forEach(c => {
      const p = c.mixPenetration.find(m => m.key === cat.key);
      if (p) {
        if (p.active) currentCatSales += p.monthlyAvg;
        potentialCatSales += p.potential;
      }
    });

    const penetrationRate = potentialCatSales > 0 ? (currentCatSales / potentialCatSales) * 100 : 0;

    return {
      ...cat,
      currentSales: currentCatSales,
      potentialSales: potentialCatSales,
      penetrationRate
    };
  });

  return (
    <div className="performance-view animate-fade-in">
      {/* Top Multi-Period Comparison Cards */}
      <div className="perf-summary-grid">
        <div className="perf-card glass-panel highlight-emerald">
          <div className="perf-card-header">
            <span className="perf-title">Mês Atual (Em Andamento)</span>
            <span className="badge badge-emerald">Período Atual</span>
          </div>
          <div className="perf-value-wrap">
            <span className="perf-amount text-emerald">{formatCurrency(currentMonthTotal)}</span>
          </div>
          <div className="perf-comparisons">
            <span className={`perf-comp-pill ${diffMoM >= 0 ? 'pill-up' : 'pill-down'}`}>
              {diffMoM >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatPercent(diffMoM)} vs Mês Anterior
            </span>
            <span className={`perf-comp-pill ${diffYoY >= 0 ? 'pill-up' : 'pill-down'}`}>
              {diffYoY >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {formatPercent(diffYoY)} vs Mesmo Mês Ano Passado
            </span>
          </div>
        </div>

        <div className="perf-card glass-panel highlight-cyan">
          <div className="perf-card-header">
            <span className="perf-title">Mês Anterior (M-1)</span>
            <span className="badge badge-cyan">Fechamento</span>
          </div>
          <div className="perf-value-wrap">
            <span className="perf-amount">{formatCurrency(prevMonthTotal)}</span>
          </div>
          <p className="perf-subtext">Faturamento consolidado da carteira no mês anterior</p>
        </div>

        <div className="perf-card glass-panel highlight-indigo">
          <div className="perf-card-header">
            <span className="perf-title">Mesmo Mês do Ano Passado (YoY)</span>
            <span className="badge badge-indigo">Sazonalidade</span>
          </div>
          <div className="perf-value-wrap">
            <span className="perf-amount">{formatCurrency(lastYearTotal)}</span>
          </div>
          <p className="perf-subtext">Base histórica real do mesmo período em 2025</p>
        </div>
      </div>

      {/* Visual Comparative Chart Bar */}
      <div className="perf-chart-card glass-panel">
        <div className="chart-header">
          <div>
            <h3>Comparativo Visual Multi-Período (Faturamento R$)</h3>
            <span className="chart-sub">Análise direta de sazonalidade e evolução do faturamento comercial</span>
          </div>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${selectedView === 'by-client' ? 'active' : ''}`}
              onClick={() => setSelectedView('by-client')}
            >
              Por Cliente / Rede
            </button>
            <button 
              className={`toggle-btn ${selectedView === 'by-category' ? 'active' : ''}`}
              onClick={() => setSelectedView('by-category')}
            >
              Por Linha de Produto
            </button>
          </div>
        </div>

        {/* Global Multi-Period Bar Comparison */}
        <div className="global-bar-comparison">
          <div className="bar-group">
            <div className="bar-label-top">
              <span>Mês Atual: {formatCurrency(currentMonthTotal)}</span>
              <span className="bar-percent text-emerald">100% da meta em curso</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill bar-fill-emerald" 
                style={{ width: `${Math.min((currentMonthTotal / Math.max(prevMonthTotal, lastYearTotal, 1)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bar-group">
            <div className="bar-label-top">
              <span>Mês Anterior (M-1): {formatCurrency(prevMonthTotal)}</span>
              <span className="bar-percent text-cyan">Base de comparação direta</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill bar-fill-cyan" 
                style={{ width: '92%' }}
              ></div>
            </div>
          </div>

          <div className="bar-group">
            <div className="bar-label-top">
              <span>Mesmo Mês Ano Anterior (YoY): {formatCurrency(lastYearTotal)}</span>
              <span className="bar-percent text-indigo">Sazonalidade 2025</span>
            </div>
            <div className="bar-track">
              <div 
                className="bar-fill bar-fill-indigo" 
                style={{ width: '85%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED VIEW: BY CLIENT OR BY CATEGORY */}
      {selectedView === 'by-client' ? (
        <div className="perf-table-card glass-panel">
          <div className="table-header-title">
            <h3>Comparativo Individual por Cliente (Atual vs M-1 vs Ano Passado)</h3>
            <p>Destaque para contas com crescimento acelerado ou quedas acentuadas que exigem intervenção.</p>
          </div>

          <table className="rep-table">
            <thead>
              <tr>
                <th>Cliente / Rede Econômica</th>
                <th>Vendedor</th>
                <th>Mês Atual (R$)</th>
                <th>Mês Anterior M-1 (R$)</th>
                <th>Ano Passado YoY (R$)</th>
                <th>Variação MoM</th>
                <th>Variação YoY</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => {
                const isMoMDown = client.dropPercentageMoM < 0;
                const isYoYDown = client.dropPercentageYoY < 0;

                return (
                  <tr key={client.id}>
                    <td>
                      <div>
                        <strong>{client.tradeName}</strong>
                        <span className="cell-sub">{client.economicGroup} • {client.city}</span>
                      </div>
                    </td>
                    <td>{client.sellerName}</td>
                    <td>
                      <strong className="text-emerald">{formatCurrency(client.currentMonthSales)}</strong>
                    </td>
                    <td>{formatCurrency(client.prevMonthSales)}</td>
                    <td>{formatCurrency(client.sameMonthLastYearSales)}</td>
                    <td>
                      <span className={`variation-pill ${isMoMDown ? 'pill-down' : 'pill-up'}`}>
                        {isMoMDown ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                        {formatPercent(client.dropPercentageMoM)}
                      </span>
                    </td>
                    <td>
                      <span className={`variation-pill ${isYoYDown ? 'pill-down' : 'pill-up'}`}>
                        {isYoYDown ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                        {formatPercent(client.dropPercentageYoY)}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => onSelectClientForAction(client)}
                        className="btn-sm btn-secondary"
                      >
                        Atender
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="perf-category-grid">
          {categoryStats.map(cat => (
            <div key={cat.key} className="cat-perf-card glass-panel">
              <div className="cat-perf-top">
                <span className="cat-badge">
                  {cat.label}
                </span>
                <span className="cat-pen-rate">{cat.penetrationRate.toFixed(0)}% do Potencial</span>
              </div>

              <div className="cat-sales-row">
                <div className="cat-sale-item">
                  <span className="cs-lbl">Faturamento Atual:</span>
                  <span className="cs-val">{formatCurrency(cat.currentSales)}</span>
                </div>
                <div className="cat-sale-item">
                  <span className="cs-lbl">Potencial Estimado:</span>
                  <span className="cs-val">{formatCurrency(cat.potentialSales)}</span>
                </div>
              </div>

              <div className="cat-progress-track">
                <div 
                  className="cat-progress-bar"
                  style={{ width: `${cat.penetrationRate}%` }}
                ></div>
              </div>

              <p className="cat-desc">{cat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

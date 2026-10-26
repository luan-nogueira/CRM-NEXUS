import React, { useState } from 'react';
import { 
  Layers, 
  Check, 
  X, 
  ArrowRight, 
  MessageSquare
} from 'lucide-react';
import type { Client, ProductCategoryKey } from '../types/crm';
import { formatCurrency, CATEGORIES_CONFIG } from '../utils/intelligenceEngine';

interface MixExpansionViewProps {
  clients: Client[];
  onSelectClientForAction: (client: Client) => void;
  onOpenWhatsApp: (client: Client) => void;
  onOpenNewOrder?: (client: Client) => void;
}

export const MixExpansionView: React.FC<MixExpansionViewProps> = ({
  clients,
  onSelectClientForAction,
  onOpenWhatsApp
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategoryKey | 'all'>('all');

  // Calculate missing mix opportunities
  const opportunities = clients.flatMap(client => {
    return client.mixPenetration
      .filter(m => !m.active && m.potential > 0)
      .map(m => ({
        client,
        category: m,
        unclaimedMoney: m.potential
      }));
  }).sort((a, b) => b.unclaimedMoney - a.unclaimedMoney);

  const filteredOpportunities = selectedCategory === 'all'
    ? opportunities
    : opportunities.filter(o => o.category.key === selectedCategory);

  const totalUnclaimedRevenue = opportunities.reduce((acc, o) => acc + o.unclaimedMoney, 0);

  return (
    <div className="mix-view animate-fade-in">
      {/* Intro Banner */}
      <div className="mix-hero glass-panel">
        <div className="mix-hero-content">
          <div className="mix-icon-wrap">
            <Layers size={28} className="text-emerald" />
          </div>
          <div>
            <h2>Expansão de Mix & Venda Cruzada (Cross-Selling)</h2>
            <p>
              Identifique categorias que o cliente consome no mercado mas compra de concorrentes.
              Ative novas linhas para expandir o ticket médio sem aumentar o número de visitas.
            </p>
          </div>
        </div>

        <div className="mix-hero-stat">
          <span className="hero-stat-label">Dinheiro Oculto na Carteira</span>
          <span className="hero-stat-number text-emerald">{formatCurrency(totalUnclaimedRevenue)} /mês</span>
          <span className="hero-stat-sub">{opportunities.length} oportunidades de penetração mapeadas</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-pills-bar glass-panel">
        <span className="filter-pill-label">Filtrar Categoria para Expandir:</span>
        <button 
          className={`cat-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Todas as Categorias ({opportunities.length})
        </button>
        {CATEGORIES_CONFIG.map(cat => {
          const count = opportunities.filter(o => o.category.key === cat.key).length;
          return (
            <button 
              key={cat.key}
              className={`cat-pill-btn ${selectedCategory === cat.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              <span className="color-dot" style={{ backgroundColor: cat.color }}></span>
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Cross-Selling Opportunities List */}
      <div className="opportunities-card glass-panel">
        <div className="opp-header">
          <h3>Oportunidades Ranqueadas de Ativação de Mix</h3>
          <span className="opp-sub">Ordenado pelo maior potencial financeiro estimado</span>
        </div>

        <div className="opportunities-grid">
          {filteredOpportunities.map((opp, index) => {
            const catConfig = CATEGORIES_CONFIG.find(c => c.key === opp.category.key);

            return (
              <div key={`${opp.client.id}-${opp.category.key}-${index}`} className="opp-box glass-panel">
                <div className="opp-box-header">
                  <div>
                    <span className="badge badge-emerald">#{index + 1} Maior Potencial</span>
                    <h4>{opp.client.tradeName}</h4>
                    <span className="opp-meta">{opp.client.segment} • {opp.client.city} • Vendedor: {opp.client.sellerName}</span>
                  </div>

                  <div className="opp-value-box">
                    <span className="opp-val-label">Potencial Incremental</span>
                    <span className="opp-val text-emerald">+{formatCurrency(opp.unclaimedMoney)}/mês</span>
                  </div>
                </div>

                <div className="opp-cat-row">
                  <div className="cat-target-pill" style={{ borderColor: catConfig?.color, color: catConfig?.color }}>
                    <Layers size={14} />
                    <strong>Linha Alvo: {opp.category.label}</strong>
                  </div>
                  <span className="opp-gap-reason">
                    <strong>Motivo do Gap:</strong> {opp.category.gapReason || 'Cliente ainda não testou esta linha com nossa empresa.'}
                  </span>
                </div>

                <div className="opp-current-mix">
                  <span className="current-mix-title">Linhas já compradas pelo cliente:</span>
                  <div className="mini-mix-badges">
                    {opp.client.mixPenetration.map(m => (
                      <span 
                        key={m.key} 
                        className={`mini-mix-badge ${m.active ? 'active' : 'inactive'}`}
                      >
                        {m.active ? <Check size={12} className="text-emerald" /> : <X size={12} className="text-rose" />}
                        {m.label} {m.active && `(${formatCurrency(m.monthlyAvg)})`}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="opp-box-footer">
                  <button 
                    onClick={() => onOpenWhatsApp(opp.client)}
                    className="btn-sm btn-whatsapp"
                  >
                    <MessageSquare size={14} />
                    <span>Enviar Proposta de Mix</span>
                  </button>

                  <button 
                    onClick={() => onSelectClientForAction(opp.client)}
                    className="btn-sm btn-primary"
                  >
                    <span>Atender no Plano do Dia</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

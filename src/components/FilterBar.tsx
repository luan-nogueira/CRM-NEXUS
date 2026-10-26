import { Filter, Calendar, Layers, Network, Tag, RotateCcw } from 'lucide-react';
import type { FilterState, ProductCategoryKey } from '../types/crm';
import { CATEGORIES_CONFIG } from '../utils/intelligenceEngine';
import { ECONOMIC_GROUPS } from '../data/mockData';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  sellers?: { id: string; name: string }[];
  totalResultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  totalResultsCount
}) => {
  const handleReset = () => {
    setFilters({
      cutoffDays: 'all',
      category: 'all',
      seller: 'all',
      economicGroup: 'all',
      status: 'all',
      searchQuery: ''
    });
  };

  const isFiltered = filters.cutoffDays !== 'all' || 
    filters.category !== 'all' || 
    filters.seller !== 'all' || 
    filters.economicGroup !== 'all' || 
    filters.status !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="filter-bar glass-panel">
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={16} className="text-emerald" />
          <span>Filtros Comerciais de Visualização</span>
          <span className="filter-count">({totalResultsCount} clientes listados)</span>
        </div>
        {isFiltered && (
          <button onClick={handleReset} className="reset-filter-btn">
            <RotateCcw size={13} />
            <span>Limpar Filtros</span>
          </button>
        )}
      </div>

      <div className="filter-grid">
        {/* Data de Corte / Dias sem Comprar */}
        <div className="filter-item">
          <label className="filter-label">
            <Calendar size={13} />
            <span>Data de Corte (Dias Inativo)</span>
          </label>
          <select 
            value={filters.cutoffDays} 
            onChange={(e) => setFilters(prev => ({
              ...prev,
              cutoffDays: e.target.value === 'all' ? 'all' : Number(e.target.value)
            }))}
            className="filter-select"
          >
            <option value="all">Todas as Datas de Corte</option>
            <option value={7}>&gt; 7 dias sem compra</option>
            <option value={14}>&gt; 14 dias sem compra</option>
            <option value={21}>&gt; 21 dias sem compra (Atraso)</option>
            <option value={30}>&gt; 30 dias sem compra (Crítico)</option>
            <option value={60}>&gt; 60 dias sem compra (Inativo)</option>
          </select>
        </div>

        {/* Categorias de Produto */}
        <div className="filter-item">
          <label className="filter-label">
            <Layers size={13} />
            <span>Categoria de Produto</span>
          </label>
          <select 
            value={filters.category} 
            onChange={(e) => setFilters(prev => ({
              ...prev,
              category: e.target.value as ProductCategoryKey | 'all'
            }))}
            className="filter-select"
          >
            <option value="all">Todas as Categorias</option>
            {CATEGORIES_CONFIG.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Agrupamento de Redes Econômicas */}
        <div className="filter-item">
          <label className="filter-label">
            <Network size={13} />
            <span>Rede Econômica / Grupo</span>
          </label>
          <select 
            value={filters.economicGroup} 
            onChange={(e) => setFilters(prev => ({
              ...prev,
              economicGroup: e.target.value
            }))}
            className="filter-select"
          >
            <option value="all">Todas as Redes e Avulsos</option>
            {ECONOMIC_GROUPS.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        {/* Status da Carteira */}
        <div className="filter-item">
          <label className="filter-label">
            <Tag size={13} />
            <span>Status da Carteira</span>
          </label>
          <select 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({
              ...prev,
              status: e.target.value as any
            }))}
            className="filter-select"
          >
            <option value="all">Todos os Status</option>
            <option value="overdue">Em Atraso de Reposição</option>
            <option value="churn_risk">Risco de Churn / Queda</option>
            <option value="in_window">Na Janela de Recompra</option>
            <option value="active">Em Dia / Ativo</option>
            <option value="inactive">Inativo (&gt; 60 dias)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

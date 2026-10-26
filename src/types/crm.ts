export type AppTheme = 'light' | 'dark';

export type ClientStatus = 'active' | 'in_window' | 'overdue' | 'churn_risk' | 'inactive';

export type ProductCategoryKey = 'dryGoods' | 'dairyRefrigerated' | 'frozen' | 'beverages' | 'cleaning';

export interface CategoryInfo {
  key: ProductCategoryKey;
  label: string;
  color: string;
}

export interface MixCategoryStatus {
  key: ProductCategoryKey;
  label: string;
  active: boolean;
  monthlyAvg: number;
  potential: number;
  lastPurchaseDate?: string;
  gapReason?: string;
}

export interface SuggestedProduct {
  id: string;
  sku: string;
  name: string;
  category: ProductCategoryKey;
  categoryLabel: string;
  unit: string;
  lastPrice: number;
  suggestedQty: number;
  monthlyRunRate: number;
  priority: 'essential' | 'recurrence' | 'mix_expansion';
  reason: string;
}

export interface OrderHistory {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  itemsCount: number;
  status: 'faturado' | 'entregue' | 'cancelado';
  categories: ProductCategoryKey[];
}

export interface InteractionLog {
  id: string;
  date: string;
  type: 'call' | 'whatsapp' | 'visit' | 'order_placed' | 'rescheduled' | 'no_contact';
  sellerName: string;
  notes: string;
  orderValue?: number;
  nextContactDate?: string;
}

export interface Client {
  id: string;
  name: string;
  tradeName: string; // Nome Fantasia
  cnpj: string;
  segment: string;
  economicGroup: string; // ex: "Rede CompreBem", "Grupo Sabor & Arte", "Avulso"
  isMatrix: boolean;
  branchCount?: number;
  city: string;
  state: string;
  phone: string;
  whatsapp: string;
  buyerName: string;
  buyerRole: string;
  sellerId: string;
  sellerName: string;
  
  // Temporal e Recorrência
  lastPurchaseDate: string;
  daysWithoutPurchase: number;
  averageCycleDays: number; // Intervalo normal entre pedidos
  overdueDays: number; // Dias atrasados além da média
  status: ClientStatus;

  // Inteligência Financeira
  estimatedPotentialMonthly: number; // R$ potencial baseado no histórico real
  currentMonthSales: number; // R$ vendas no mês atual
  prevMonthSales: number; // R$ vendas mês anterior (M-1)
  sameMonthLastYearSales: number; // R$ vendas mesmo mês ano anterior (YoY)
  dropPercentageMoM: number; // % queda vs mês anterior
  dropPercentageYoY: number; // % queda vs ano passado
  churnRisk: 'low' | 'moderate' | 'high' | 'critical';
  churnReason: string;

  // Expansão de Mix
  mixPenetration: MixCategoryStatus[];
  mixCoveragePercent: number;

  // Sugestões e Histórico
  suggestedOrder: SuggestedProduct[];
  recentOrders: OrderHistory[];
  interactionLogs: InteractionLog[];

  // Priorização Algorítmica de Atendimento
  priorityScore: number;
  moneyOnTheTable: number; // Valor estimado pendente para este ciclo
  starred?: boolean;
}

export interface FilterState {
  cutoffDays: number | 'all';
  category: ProductCategoryKey | 'all';
  seller: string | 'all';
  economicGroup: string | 'all';
  status: ClientStatus | 'all';
  searchQuery: string;
}

export interface DailyQueueProgress {
  totalInQueue: number;
  contactedCount: number;
  ordersPlacedCount: number;
  ordersPlacedTotal: number;
  rescheduledCount: number;
}

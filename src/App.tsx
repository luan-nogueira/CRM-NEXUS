import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { DailyPlanView } from './components/DailyPlanView';
import { SalesIntelligenceView } from './components/SalesIntelligenceView';
import { PerformanceComparisonView } from './components/PerformanceComparisonView';
import { MixExpansionView } from './components/MixExpansionView';
import { ClientsListView } from './components/ClientsListView';
import { WhatsAppModal } from './components/WhatsAppModal';
import { NewOrderModal } from './components/NewOrderModal';
import { ClientDetailModal } from './components/ClientDetailModal';

import { INITIAL_CLIENTS, INITIAL_SELLERS } from './data/mockData';
import type { Client, FilterState, DailyQueueProgress, InteractionLog, AppTheme } from './types/crm';
import { filterClients, calculatePriorityScore } from './utils/intelligenceEngine';
import './App.css';

export function App() {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('pulse_crm_theme') as AppTheme) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('pulse_crm_theme', currentTheme);
  }, [currentTheme]);

  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [activeTab, setActiveTab] = useState<'daily-plan' | 'intelligence' | 'performance' | 'mix' | 'clients'>('daily-plan');
  const [selectedSeller, setSelectedSeller] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [filters, setFilters] = useState<FilterState>({
    cutoffDays: 'all',
    category: 'all',
    seller: 'all',
    economicGroup: 'all',
    status: 'all',
    searchQuery: ''
  });

  // Sync header search and seller with filters
  const effectiveFilters = useMemo<FilterState>(() => ({
    ...filters,
    seller: selectedSeller,
    searchQuery
  }), [filters, selectedSeller, searchQuery]);

  // Filter clients
  const displayedClients = useMemo(() => {
    return filterClients(clients, effectiveFilters);
  }, [clients, effectiveFilters]);

  // Active client in the Daily Plan Stepper
  const [activeClientId, setActiveClientId] = useState<string>(displayedClients[0]?.id || INITIAL_CLIENTS[0]?.id);

  const activeClient = useMemo(() => {
    return displayedClients.find(c => c.id === activeClientId) || displayedClients[0] || null;
  }, [displayedClients, activeClientId]);

  // Modal states
  const [whatsAppModalClient, setWhatsAppModalClient] = useState<Client | null>(null);
  const [newOrderModalClient, setNewOrderModalClient] = useState<Client | null>(null);
  const [detailModalClient, setDetailModalClient] = useState<Client | null>(null);

  // Queue execution progress
  const [queueProgress, setQueueProgress] = useState<DailyQueueProgress>({
    totalInQueue: INITIAL_CLIENTS.length,
    contactedCount: 1,
    ordersPlacedCount: 0,
    ordersPlacedTotal: 0,
    rescheduledCount: 0
  });

  // Handler: Log interaction result (call, whatsapp, visit, reschedule)
  const handleLogInteraction = (clientId: string, type: InteractionLog['type'], notes: string, orderValue?: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: InteractionLog = {
      id: `log-${Date.now()}`,
      date: todayStr,
      type,
      sellerName: 'Vendedor Atual',
      notes,
      orderValue
    };

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          interactionLogs: [newLog, ...c.interactionLogs]
        };
      }
      return c;
    }));

    setQueueProgress(prev => ({
      ...prev,
      contactedCount: prev.contactedCount + 1,
      rescheduledCount: type === 'rescheduled' ? prev.rescheduledCount + 1 : prev.rescheduledCount
    }));
  };

  // Handler: Complete deal / close order
  const handleOrderCompleted = (clientId: string, total: number, itemsCount: number, notes: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `PED-${Math.floor(10000 + Math.random() * 90000)}`,
      date: todayStr,
      total,
      itemsCount,
      status: 'faturado' as const,
      categories: ['dryGoods' as const, 'dairyRefrigerated' as const]
    };

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const updatedCurrentMonth = c.currentMonthSales + total;
        const updatedMoneyOnTable = Math.max(c.moneyOnTheTable - total, 0);
        const updatedClient: Client = {
          ...c,
          lastPurchaseDate: todayStr,
          daysWithoutPurchase: 0,
          overdueDays: 0,
          status: 'active',
          currentMonthSales: updatedCurrentMonth,
          moneyOnTheTable: updatedMoneyOnTable,
          recentOrders: [newOrder, ...c.recentOrders],
          interactionLogs: [
            {
              id: `log-${Date.now()}`,
              date: todayStr,
              type: 'order_placed',
              sellerName: c.sellerName,
              notes: `Pedido ${newOrder.orderNumber} emitido com sucesso! ${notes}`,
              orderValue: total
            },
            ...c.interactionLogs
          ]
        };
        updatedClient.priorityScore = calculatePriorityScore(updatedClient);
        return updatedClient;
      }
      return c;
    }));

    setQueueProgress(prev => ({
      ...prev,
      contactedCount: prev.contactedCount + 1,
      ordersPlacedCount: prev.ordersPlacedCount + 1,
      ordersPlacedTotal: prev.ordersPlacedTotal + total
    }));
  };

  // Switch to Daily Plan and focus selected client
  const handleSelectClientForAction = (client: Client) => {
    setActiveClientId(client.id);
    setActiveTab('daily-plan');
  };

  return (
    <div className="app-container">
      {/* Top Header & Navigation */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSeller={selectedSeller}
        setSelectedSeller={setSelectedSeller}
        sellers={INITIAL_SELLERS}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        clients={clients}
        queueProgress={queueProgress}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Dynamic Filter Bar */}
        <FilterBar 
          filters={filters}
          setFilters={setFilters}
          sellers={INITIAL_SELLERS}
          totalResultsCount={displayedClients.length}
        />

        {/* View Switcher */}
        {activeTab === 'daily-plan' && (
          <DailyPlanView 
            clients={displayedClients}
            activeClient={activeClient}
            setActiveClient={(c) => setActiveClientId(c.id)}
            onOpenWhatsApp={(c) => setWhatsAppModalClient(c)}
            onOpenNewOrder={(c) => setNewOrderModalClient(c)}
            onOpenClientDetail={(c) => setDetailModalClient(c)}
            onLogInteraction={handleLogInteraction}
          />
        )}

        {activeTab === 'intelligence' && (
          <SalesIntelligenceView 
            clients={displayedClients}
            onSelectClientForAction={handleSelectClientForAction}
            onOpenWhatsApp={(c) => setWhatsAppModalClient(c)}
            onOpenNewOrder={(c) => setNewOrderModalClient(c)}
          />
        )}

        {activeTab === 'performance' && (
          <PerformanceComparisonView 
            clients={displayedClients}
            onSelectClientForAction={handleSelectClientForAction}
          />
        )}

        {activeTab === 'mix' && (
          <MixExpansionView 
            clients={displayedClients}
            onSelectClientForAction={handleSelectClientForAction}
            onOpenWhatsApp={(c) => setWhatsAppModalClient(c)}
            onOpenNewOrder={(c) => setNewOrderModalClient(c)}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsListView 
            clients={displayedClients}
            onSelectClientForAction={handleSelectClientForAction}
            onOpenClientDetail={(c) => setDetailModalClient(c)}
            onOpenWhatsApp={(c) => setWhatsAppModalClient(c)}
            onOpenNewOrder={(c) => setNewOrderModalClient(c)}
          />
        )}
      </main>

      {/* WhatsApp Pitch Modal */}
      {whatsAppModalClient && (
        <WhatsAppModal 
          client={whatsAppModalClient}
          onClose={() => setWhatsAppModalClient(null)}
          onMessageSent={(notes) => handleLogInteraction(whatsAppModalClient.id, 'whatsapp', notes)}
        />
      )}

      {/* New Order Issuer Modal */}
      {newOrderModalClient && (
        <NewOrderModal 
          client={newOrderModalClient}
          onClose={() => setNewOrderModalClient(null)}
          onOrderCompleted={handleOrderCompleted}
        />
      )}

      {/* 360 Client Detailed Inspection Modal */}
      {detailModalClient && (
        <ClientDetailModal 
          client={detailModalClient}
          onClose={() => setDetailModalClient(null)}
          onOpenWhatsApp={(c) => setWhatsAppModalClient(c)}
          onOpenNewOrder={(c) => setNewOrderModalClient(c)}
        />
      )}
    </div>
  );
}

export default App;

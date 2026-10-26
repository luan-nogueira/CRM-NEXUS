import React, { useState } from 'react';
import { ShoppingCart, Check, X, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Client } from '../types/crm';
import { formatCurrency } from '../utils/intelligenceEngine';

interface NewOrderModalProps {
  client: Client | null;
  onClose: () => void;
  onOrderCompleted: (clientId: string, total: number, itemsCount: number, notes: string) => void;
}

interface OrderItemState {
  id: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  client,
  onClose,
  onOrderCompleted
}) => {
  if (!client) return null;

  // Initialize items from client's suggested order
  const [items, setItems] = useState<OrderItemState[]>(
    client.suggestedOrder.map(s => ({
      id: s.id,
      name: s.name,
      unit: s.unit,
      price: s.lastPrice,
      qty: s.suggestedQty
    }))
  );

  const [paymentTerms, setPaymentTerms] = useState('28 dias (Boleto Bancário)');
  const [notes, setNotes] = useState('Pedido gerado a partir da sugestão de reposição inteligente.');

  const handleQtyChange = (id: string, qty: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(qty, 0) } : item));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const orderTotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const activeItemsCount = items.filter(i => i.qty > 0).length;

  const handleConfirmOrder = () => {
    // Trigger festive confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    onOrderCompleted(client.id, orderTotal, activeItemsCount, notes);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box modal-lg glass-panel animate-fade-in">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="order-icon-badge">
              <ShoppingCart size={20} className="text-emerald" />
            </div>
            <div>
              <h3>Emissão de Pedido de Venda - {client.tradeName}</h3>
              <span className="modal-sub">
                Comprador: <strong>{client.buyerName}</strong> • CNPJ: {client.cnpj}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="order-items-table-wrap">
            <table className="rep-table">
              <thead>
                <tr>
                  <th>Produto / SKU</th>
                  <th>Unidade</th>
                  <th>Preço Unit.</th>
                  <th>Quantidade</th>
                  <th>Subtotal</th>
                  <th>Remover</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className="font-semibold">{item.name}</span>
                    </td>
                    <td>{item.unit}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td style={{ width: '130px' }}>
                      <input 
                        type="number"
                        min="0"
                        value={item.qty}
                        onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                        className="qty-input"
                      />
                    </td>
                    <td>
                      <strong className="text-emerald">{formatCurrency(item.qty * item.price)}</strong>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="btn-trash"
                        title="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-details-grid">
            <div className="order-field">
              <label className="editor-label">Condição de Pagamento:</label>
              <select 
                value={paymentTerms} 
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="filter-select"
              >
                <option value="28 dias (Boleto)">28 dias (Boleto Bancário)</option>
                <option value="14/28/42 dias">14/28/42 dias</option>
                <option value="À Vista Antecipado (3% desc)">À Vista Antecipado (3% desc)</option>
                <option value="7 dias">7 dias</option>
              </select>
            </div>

            <div className="order-field">
              <label className="editor-label">Observações da Entrega / Faturamento:</label>
              <input 
                type="text" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="filter-select"
              />
            </div>
          </div>

          <div className="order-summary-box">
            <div className="summary-left">
              <span>Total de Itens: <strong>{activeItemsCount} itens</strong></span>
              <span>Entrega estimada: <strong>Em até 24h úteis</strong></span>
            </div>
            <div className="summary-right">
              <span className="summary-label">Valor Total do Pedido:</span>
              <span className="summary-val text-emerald">{formatCurrency(orderTotal)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancelar
          </button>

          <button 
            onClick={handleConfirmOrder} 
            disabled={orderTotal === 0}
            className="btn-primary btn-deal-confirm"
          >
            <Check size={18} />
            <span>Confirmar Fechamento do Pedido ({formatCurrency(orderTotal)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

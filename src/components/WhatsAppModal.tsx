import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ExternalLink, X, Info } from 'lucide-react';
import type { Client } from '../types/crm';
import { generateWhatsAppPitch } from '../utils/intelligenceEngine';

interface WhatsAppModalProps {
  client: Client | null;
  onClose: () => void;
  onMessageSent: (notes: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  client,
  onClose,
  onMessageSent
}) => {
  if (!client) return null;

  const initialText = generateWhatsAppPitch(client);
  const [message, setMessage] = useState(initialText);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsAppWeb = () => {
    handleCopy();
    const cleanPhone = client.whatsapp.replace(/\D/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encoded}`, '_blank');
    onMessageSent(`Mensagem enviada via WhatsApp para ${client.buyerName}.`);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box glass-panel animate-fade-in">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="wa-icon-badge">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3>Mensagem WhatsApp - {client.tradeName}</h3>
              <span className="modal-sub">
                Comprador: <strong>{client.buyerName}</strong> ({client.whatsapp})
              </span>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="ai-script-notice">
            <Info size={16} />
            <span>
              Mensagem gerada com base no ciclo de reposição ({client.daysWithoutPurchase} dias) 
              e no giro de compras habitual.
            </span>
          </div>

          <div className="message-editor-wrap">
            <label className="editor-label">Texto da Mensagem (Editável):</label>
            <textarea 
              rows={10}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="message-textarea"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleCopy} className="btn-secondary">
            {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
            <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto'}</span>
          </button>

          <button onClick={handleOpenWhatsAppWeb} className="btn-primary btn-whatsapp-direct">
            <ExternalLink size={16} />
            <span>Abrir no WhatsApp Web & Registrar Contato</span>
          </button>
        </div>
      </div>
    </div>
  );
};

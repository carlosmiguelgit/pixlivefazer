import { useMemo, type FC } from 'react';
import { motion } from 'motion/react';
import { X, Share2 } from 'lucide-react';
import { Notification } from '../types';

interface NubankReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
  editedValue: number;
  isAnonymousMode: boolean;
  destBank: string;
  destAgency: string;
  destAccount: string;
}

const DestinoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 13L17 17M17 17L15 15M17 17L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const OrigemIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M17 15L17 11M17 11L15 13M17 11L19 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const NubankReceipt: FC<NubankReceiptProps> = ({
  isOpen,
  onClose,
  notification,
  editedValue,
  isAnonymousMode,
  destBank,
  destAgency,
  destAccount
}) => {
  const receiptData = useMemo(() => {
    const randomOriginAccount = Math.floor(10000000 + Math.random() * 90000000).toString() + "-" + Math.floor(Math.random() * 10);
    
    const cpfMid1 = Math.floor(100 + Math.random() * 900);
    const cpfMid2 = Math.floor(100 + Math.random() * 900);
    const formattedCpf = `...${cpfMid1}.${cpfMid2}-...`;

    const transId = `${Math.random().toString(16).substr(2, 8)}-${Math.random().toString(16).substr(2, 4)}-4770-a3c4-${Math.random().toString(16).substr(2, 12)}`;

    return {
      bank: destBank,
      agency: destAgency,
      account: destAccount,
      originAccount: randomOriginAccount,
      date: "",
      cpf: formattedCpf,
      transId
    };
  }, [notification.id, destBank, destAgency, destAccount]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 250 }}
      className="absolute inset-0 bg-white z-[300] overflow-y-auto flex flex-col text-slate-900"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <button onClick={onClose} className="p-2 -ml-2">
          <X className="w-6 h-6 text-slate-400" />
        </button>
        <button className="p-2 -mr-2">
          <Share2 className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="px-8 pt-8 pb-0 space-y-8">
        {/* Logo Nu */}
        <img src="/nu.png" alt="Nubank" className="h-12 w-auto object-contain -ml-2" />

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Comprovante de transferência</h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">{receiptData.date}</p>
        </div>

        {/* Valor e Tipo */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <span className="text-base font-bold">Valor</span>
            <span className="text-base font-medium text-slate-500">R$ {editedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-base font-bold">Tipo de transferência</span>
            <span className="text-base font-medium text-slate-500">Pix</span>
          </div>
        </div>

        {/* Destino */}
        <div className="pt-4 space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-slate-900">
              <DestinoIcon />
            </div>
            <span className="text-lg font-bold">Destino</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Nome</span>
              <span className="text-base font-medium text-slate-500 text-right max-w-[200px]">
                {isAnonymousMode ? 'Alguém' : (notification.fullName || notification.name).split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">CPF</span>
              <span className="text-base font-medium text-slate-500">{receiptData.cpf}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Instituição</span>
              <span className="text-base font-medium text-slate-500 text-right max-w-[200px] uppercase">{receiptData.bank}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Agência</span>
              <span className="text-base font-medium text-slate-500">{receiptData.agency}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Conta</span>
              <span className="text-base font-medium text-slate-500">{receiptData.account}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Tipo de conta</span>
              <span className="text-base font-medium text-slate-500">Conta Poupança</span>
            </div>
          </div>
        </div>

        {/* Origem */}
        <div className="pt-4 space-y-6 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="text-slate-900">
              <OrigemIcon />
            </div>
            <span className="text-lg font-bold">Origem</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Nome</span>
              <span className="text-base font-medium text-slate-500">Guilherme Henrique Valença</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Instituição</span>
              <span className="text-base font-medium text-slate-500">NU PAGAMENTOS - IP</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Agência</span>
              <span className="text-base font-medium text-slate-500">0001</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Conta</span>
              <span className="text-base font-medium text-slate-500">{receiptData.originAccount}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-base font-bold">Tipo de conta</span>
              <span className="text-base font-medium text-slate-500">...055.848-...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Identical to Image */}
      <div className="mt-12 bg-[#F5F5F5] px-8 py-10 space-y-8">
        <div className="space-y-1">
          <p className="text-[15px] font-bold text-slate-900">Nu Pagamentos S.A. - Instituição de Pagamento</p>
          <p className="text-[15px] font-bold text-slate-900">CNPJ 18.236.120/0001-58</p>
        </div>

        <div className="space-y-1">
          <p className="text-[15px] font-bold text-slate-900">ID da transação:</p>
          <p className="text-[15px] font-bold text-slate-900 break-all">{receiptData.transId}</p>
        </div>

        <p className="text-[15px] text-slate-500">Estamos aqui para ajudar se você tiver alguma dúvida.</p>

        <button className="flex items-center gap-1 text-[#820AD1] font-bold text-[15px]">
          Me ajuda
          <span className="text-xl">→</span>
        </button>

        <p className="text-[13px] text-slate-500 leading-tight">
          Ouvidoria: 0800 887 0463, atendimento em dias úteis, das 09h às 18h (horário de São Paulo).
        </p>
      </div>
    </motion.div>
  );
};

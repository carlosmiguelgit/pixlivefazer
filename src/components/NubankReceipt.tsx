import { useMemo, type FC } from 'react';
import { motion } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
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

export const NubankReceipt: FC<NubankReceiptProps> = ({
  isOpen,
  onClose,
  notification,
  editedValue,
  isAnonymousMode,
  destBank,
}) => {
  const recipientName = useMemo(() => {
    if (isAnonymousMode) return 'Alguém';
    return (notification.fullName || notification.name)
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [notification, isAnonymousMode]);

  const bankName = useMemo(() => {
    return destBank.toUpperCase();
  }, [destBank]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 250 }}
      className="fixed inset-0 bg-[#820AD1] z-[300] overflow-y-auto flex flex-col text-white"
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#820AD1] z-10 px-6 py-4 flex items-center justify-between">
        <button onClick={onClose} className="p-2 -ml-2">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        {/* Checkmark */}
        <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-bold text-white text-center mb-6">
          Sua transferência foi concluída
        </h1>

        {/* Value */}
        <div className="text-center mb-2">
          <span className="text-[36px] font-bold text-white">
            R$ {editedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Recipient */}
        <p className="text-[16px] text-white/80 text-center mb-10">
          Para {recipientName}
        </p>

        {/* Details */}
        <div className="w-full space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-white/20">
            <span className="text-[15px] text-white/60">Instituição</span>
            <span className="text-[15px] font-semibold text-white uppercase">{bankName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/20">
            <span className="text-[15px] text-white/60">Quando</span>
            <span className="text-[15px] font-semibold text-white">Agora</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 pt-6">
        <button className="w-full bg-white text-[#820AD1] font-bold text-[16px] py-4 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform">
          Abrir comprovante
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

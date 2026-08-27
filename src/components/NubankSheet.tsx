import React, { useState, useEffect, useMemo, useRef, type FC, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, ChevronRight, Pencil, Calendar, Plus, X } from 'lucide-react';
import { Notification } from '../types';
import { NubankReceipt } from './NubankReceipt';
import { BRAZILIAN_BANKS } from '../constants';

interface NubankSheetProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
  nubankBalance: number;
  onConfirm: (method: 'conta' | 'credito', editedValue: number) => void;
  isAnonymousMode: boolean;
  isDarkMode: boolean;
}

type FlowStep = 'splash' | 'select' | 'installments' | 'review' | 'pin' | 'processing' | 'success';

const ContaIcon = ({ color }: { color: string }) => (
  <svg width="22" height="12" viewBox="0 0 24 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="23" height="12" rx="1.5" stroke={color} />
    <circle cx="12" cy="6.5" r="2" stroke={color} strokeWidth="1.2" />
  </svg>
);

const CreditoIcon = ({ color }: { color: string }) => (
  <svg width="12" height="18" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="13" height="19" rx="2.5" stroke={color} />
    <circle cx="10" cy="4" r="1" fill={color} />
  </svg>
);

export const NubankSheet: FC<NubankSheetProps> = ({
  isOpen,
  onClose,
  notification,
  nubankBalance,
  onConfirm,
  isAnonymousMode,
  isDarkMode
}) => {
  const [step, setStep] = useState<FlowStep>('splash');
  const [processingText, setProcessingText] = useState("Transferindo...");
  const [selectedMethod, setSelectedMethod] = useState<'conta' | 'credito' | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isReviewReplay, setIsReviewReplay] = useState(false);
  const [digitStr, setDigitStr] = useState("0");
  const [pin, setPin] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editedValue = useMemo(() => parseInt(digitStr, 10) || 0, [digitStr]);
  const receiptClickCountRef = useRef(0);
  const receiptClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successClickCountRef = useRef(0);
  const successClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const destBankData = useMemo(() => {
    const isNubank = Math.random() < 0.7;
    const others = BRAZILIAN_BANKS.filter(b => b !== 'NU PAGAMENTOS - IP');
    const bank = isNubank ? 'NU PAGAMENTOS - IP' : others[Math.floor(Math.random() * others.length)];
    const agency = Math.floor(1000 + Math.random() * 9000).toString();
    const account = Math.floor(10000000 + Math.random() * 90000000).toString() + "-" + Math.floor(Math.random() * 10);
    return { bank, agency, account };
  }, [notification?.id]);

  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [digitStr]);

  const capitalizeEachWord = (str: string): string => {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const formatCurrencyInput = (value: number): string => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setDigitStr(digits || "0");
  };

  const handleFocus = () => {
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      setStep('splash');
      setProcessingText("Transferindo...");
      setSelectedMethod(null);
      setSelectedInstallment(1);
      setIsReceiptOpen(false);
      setIsReviewReplay(false);
      setDigitStr("0");
      setSending(false);
      
      const timer = setTimeout(() => {
        setStep('select');
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const installmentsData = useMemo(() => {
    if (!notification) return [];
    const baseValue = editedValue;
    const data = [];
    for (let i = 1; i <= 12; i++) {
      const factor = 1 + (i * 0.03);
      const total = baseValue * factor;
      const perInstallment = total / i;
      data.push({
        count: i,
        value: perInstallment,
        total: total
      });
    }
    return data;
  }, [notification, editedValue]);

  const handleConfirmMethod = () => {
    if (selectedMethod === 'credito') {
      setStep('installments');
    } else {
      setStep('review');
    }
  };

  const startProcessing = () => {
    setStep('processing');
    setTimeout(() => setProcessingText("Gerando comprovante..."), 1500);
    setTimeout(() => setProcessingText("Pronto!"), 3000);
    setTimeout(() => setStep('success'), 4500);
  };

  const handlePinComplete = () => {
    setIsReviewReplay(true);
    setSending(true);
    setStep('review');
    setTimeout(() => {
      setSending(false);
      startProcessing();
    }, 2000);
  };

  const handleFinalize = () => {
    onConfirm(selectedMethod || 'conta', editedValue);
  };

  const handleReceiptClick = () => {
    receiptClickCountRef.current++;
    
    if (receiptClickCountRef.current === 1) {
      receiptClickTimerRef.current = setTimeout(() => {
        receiptClickCountRef.current = 0;
      }, 300);
    } else if (receiptClickCountRef.current >= 2) {
      if (receiptClickTimerRef.current) {
        clearTimeout(receiptClickTimerRef.current);
      }
      receiptClickCountRef.current = 0;
      setIsReceiptOpen(false);
      handleFinalize();
    }
  };

  const handleSuccessDoubleClick = () => {
    successClickCountRef.current++;
    if (successClickCountRef.current === 1) {
      successClickTimerRef.current = setTimeout(() => {
        successClickCountRef.current = 0;
      }, 400);
    } else if (successClickCountRef.current >= 2) {
      if (successClickTimerRef.current) {
        clearTimeout(successClickTimerRef.current);
      }
      successClickCountRef.current = 0;
      handleFinalize();
    }
  };

  if (!notification) return null;

  const bgColor = isDarkMode ? 'bg-black' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const subTextColor = isDarkMode ? 'text-white/60' : 'text-slate-500';
  const borderColor = isDarkMode ? 'border-white/30' : 'border-slate-300';
  const cardBg = isDarkMode ? 'bg-white/5' : 'bg-slate-50';
  const nuPurple = '#820AD1';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 250 }}
          className={`fixed inset-0 ${bgColor} z-[200] overflow-hidden flex flex-col`}
        >
          <AnimatePresence mode="wait">
            {step === 'splash' && (
              <motion.div 
                key="splash"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#820AD1] flex items-center justify-center z-[210]"
              >
                <motion.img 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  src="/nu.png" 
                  alt="Nubank" 
                  className="w-48 h-auto brightness-0 invert" 
                />
              </motion.div>
            )}

            {step === 'select' && (
              <motion.div 
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col px-8 pt-12 pb-10"
              >
                <div className="flex items-center mb-8">
                  <button onClick={onClose} className={`p-2 -ml-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M14 5L9 11L14 17" stroke={isDarkMode ? '#ffffff66' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <p className={`text-[13px] font-medium ${subTextColor} mb-1`}>Transferir para</p>
                    <p className={`text-xl font-bold ${textColor}`}>
                      {isAnonymousMode ? 'Alguém' : capitalizeEachWord(notification.fullName || notification.name)}
                    </p>
                  </div>

                  <div className={`pb-1 border-b ${borderColor}`}>
                    <p className={`text-[13px] font-medium ${subTextColor} mb-1`}>Valor</p>
                    <div className="relative flex items-center gap-1 flex-1">
                      <span className={`text-xl font-bold ${textColor}`}>R$</span>
                      <div className="relative flex-1 min-w-0 cursor-text" onClick={() => inputRef.current?.focus()}>
                        <input
                          ref={inputRef}
                          type="text"
                          inputMode="numeric"
                          value={digitStr}
                          onChange={handleValueChange}
                          onFocus={handleFocus}
                          className="absolute inset-0 w-full opacity-0"
                        />
                        <span className={`text-xl font-bold ${textColor}`}>
                          {formatCurrencyInput(editedValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col flex-1">
                    <p className={`text-[14px] font-bold ${subTextColor} mb-4`}>Pagando com</p>
                    <div className="flex gap-3 flex-1">
                      <button
                        onClick={() => setSelectedMethod('conta')}
                        className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all flex-1 ${
                          selectedMethod === 'conta' ? 'border-[#820AD1] bg-[#820AD1]/35' : 'opacity-30'
                        }`}
                      >
                        <div className="h-8 flex items-center mb-3">
                          <ContaIcon color={selectedMethod === 'conta' ? nuPurple : (isDarkMode ? '#ffffff4d' : '#94a3b8')} />
                        </div>
                        <p className={`text-[13px] font-bold leading-tight mb-1 ${selectedMethod === 'conta' ? 'text-[#820AD1]' : textColor}`}>Conta Nubank</p>
                        <p className={`text-[10px] font-medium ${selectedMethod === 'conta' ? 'text-[#820AD1]/80' : subTextColor}`}>Atual: R$ {nubankBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className={`text-[10px] font-medium ${selectedMethod === 'conta' ? 'text-[#820AD1]/80' : subTextColor}`}>Envio imediato</p>
                      </button>

                      <button
                        onClick={() => setSelectedMethod('credito')}
                        className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all flex-1 ${
                          selectedMethod === 'credito' ? 'border-[#820AD1] bg-[#820AD1]/35' : 'opacity-30'
                        }`}
                      >
                        <div className="h-8 w-full flex justify-between items-center mb-3">
                          <CreditoIcon color={selectedMethod === 'credito' ? nuPurple : (isDarkMode ? '#ffffff4d' : '#94a3b8')} />
                          <div className="bg-[#820AD1] px-1 rounded-[2px] h-[10px] flex items-center">
                            <span className="text-[8px] font-black text-white whitespace-nowrap leading-none">12x com juros</span>
                          </div>
                        </div>
                        <p className={`text-[13px] font-bold leading-tight mb-1 ${selectedMethod === 'credito' ? 'text-[#820AD1]' : textColor}`}>Crédito Nubank</p>
                        <p className={`text-[10px] font-medium ${selectedMethod === 'credito' ? 'text-[#820AD1]/80' : subTextColor}`}>Limite: Ilimitado</p>
                        <p className={`text-[10px] font-medium ${selectedMethod === 'credito' ? 'text-[#820AD1]/80' : subTextColor}`}>Envio imediato</p>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={handleConfirmMethod}
                    disabled={!selectedMethod}
                    className={`w-full h-[38px] font-bold rounded-full active:scale-95 transition-transform text-[15px] leading-none flex items-center justify-center shadow-xl shadow-[#820AD1]/20 ${
                      selectedMethod ? 'bg-[#820AD1] text-white' : 'bg-white/10 text-white/30'
                    }`}
                  >
                    Continuar
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'installments' && (
              <motion.div 
                key="installments"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="px-8 pt-12 pb-6">
                  <button onClick={() => setStep('select')} className={`p-2 -ml-2 mb-6 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M14 5L9 11L14 17" stroke={isDarkMode ? '#ffffff66' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  
                  <h2 className={`text-2xl font-bold ${textColor} leading-tight mb-3`}>
                    Em quantas vezes você gostaria de parcelar?
                  </h2>
                  <p className={`text-sm ${subTextColor} leading-relaxed`}>
                    Mesmo parcelando, <span className={`font-bold ${textColor}`}>{isAnonymousMode ? 'Alguém' : capitalizeEachWord(notification.fullName || notification.name)}</span> vai receber tudo de uma vez e imediatamente.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-8 space-y-1 pb-32">
                  {installmentsData.map((item) => (
                    <button
                      key={item.count}
                      onClick={() => setSelectedInstallment(item.count)}
                      className={`w-full flex items-center justify-between py-5 border-b ${borderColor} transition-all active:opacity-70`}
                    >
                      <span className={`text-base font-bold ${textColor}`}>
                        {item.count} parcela{item.count > 1 ? 's' : ''} de R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedInstallment === item.count ? 'border-[#820AD1]' : (isDarkMode ? 'border-white/20' : 'border-slate-200')
                      }`}>
                        {selectedInstallment === item.count && (
                          <div className="w-3 h-3 rounded-full bg-[#820AD1]" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className={`absolute bottom-0 left-0 right-0 p-8 border-t ${borderColor} ${bgColor} flex items-center justify-between z-10`}>
                  <div className="flex flex-col">
                    <p className={`text-lg font-bold ${textColor}`}>
                      {selectedInstallment}x de R$ {installmentsData[selectedInstallment - 1]?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-[13px] ${subTextColor}`}>
                      Total: R$ {installmentsData[selectedInstallment - 1]?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('review')}
                    className="w-16 h-16 bg-[#820AD1] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#820AD1]/30 active:scale-90 transition-transform"
                  >
                    <ChevronRight className="w-10 h-10" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col"
              >
                <div className="px-8 pt-12 pb-6">
                  {!isReviewReplay && (
                    <button onClick={() => setStep('select')} className={`p-2 -ml-2 mb-8 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <path d="M14 5L9 11L14 17" stroke={isDarkMode ? '#ffffff66' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}

                  <p className={`text-[24px] font-bold ${textColor} mb-4`}>Você vai enviar</p>
                  <p className="text-[16px] font-bold text-[#820AD1] leading-tight">
                    R$ {editedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[16px] text-[#820AD1] font-medium">{selectedMethod === 'credito' ? 'Crédito Nubank' : 'Conta Nubank'}</p>
                    <Pencil size={21} className="text-[#820AD1]" />
                  </div>
                </div>

                <div className={`mx-8 h-px ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-300'}`} />

                <div className="px-8 pt-6 pb-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-semibold text-[#820AD1]">{isAnonymousMode ? 'Alguém' : capitalizeEachWord(notification.fullName || notification.name)}</p>
                    <Pencil size={21} className="text-[#820AD1]" />
                  </div>
                  <p className="text-[13px] text-[#820AD1] mt-0.5">{destBankData.bank}</p>
                </div>

                <div className={`mx-8 h-px ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-300'}`} />

                <div className="px-8 pt-6 pb-6 flex-1">
                  <p className={`text-[12px] font-semibold ${subTextColor} mb-6`}>Detalhes</p>

                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] text-zinc-400">Quando</p>
                      <Calendar size={21} className="text-[#820AD1]" />
                    </div>
                    <p className={`text-[15px] font-medium ${textColor} mt-0.5`}>Agora</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] text-zinc-400">Via</p>
                      <Pencil size={21} className="text-[#820AD1]" />
                    </div>
                    <p className={`text-[15px] font-medium ${textColor} mt-0.5`}>Pix</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[14px] text-zinc-400">Mensagem</p>
                    <Plus size={21} className="text-[#820AD1]" />
                  </div>
                </div>

                <div className={`mx-8 h-px ${isDarkMode ? 'bg-zinc-800' : 'bg-slate-300'}`} />

                <div className="px-8 pt-5 pb-8 flex items-center justify-between">
                  <div>
                    <p className={`text-[24px] font-bold ${textColor}`}>
                      R$ {editedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-[13px] ${subTextColor}`}>Valor Total</p>
                  </div>
                  {sending ? (
                    <div className="h-[52px] px-8 bg-[#820AD1] rounded-full flex items-center justify-center min-w-[130px] shadow-lg shadow-[#820AD1]/20">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    </div>
                  ) : !isReviewReplay ? (
                    <button
                      onClick={() => { setSending(true); setTimeout(() => { setPin([]); setStep('pin'); setSending(false); }, 2000); }}
                      className="h-[52px] px-8 bg-[#820AD1] text-white font-bold text-[16px] rounded-full active:scale-95 transition-transform shadow-lg shadow-[#820AD1]/20 flex items-center justify-center min-w-[130px]"
                    >
                      Enviar
                    </button>
                  ) : null}
                </div>
              </motion.div>
            )}

            {step === 'pin' && <PinScreen isDarkMode={isDarkMode} textColor={textColor} subTextColor={subTextColor} onBack={() => setStep('review')} onComplete={handlePinComplete} />}

            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col px-8 pb-24 justify-end"
              >
                <div className="h-10 mb-3 relative">
                  <AnimatePresence mode="wait">
                    <motion.h2 
                      key={processingText}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className={`absolute inset-0 text-3xl font-medium ${textColor} leading-tight`}
                    >
                      {processingText}
                    </motion.h2>
                  </AnimatePresence>
                </div>
                
                <div className={`w-full h-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'} relative overflow-hidden rounded-full`}>
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 4.5, ease: "linear" }}
                    className="absolute inset-0 bg-[#820AD1]"
                  />
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={isReceiptOpen ? handleReceiptClick : handleSuccessDoubleClick}
                className={`flex-1 flex flex-col px-8 pt-12 pb-10 ${isReceiptOpen ? 'cursor-pointer' : ''}`}
              >
                <div className="mb-10 relative mt-[40px]">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute top-0 left-0 p-2 -ml-2 -mt-2"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                  <img 
                    src="/simbolo.jpeg" 
                    alt="Sucesso" 
                    className="w-[156px] object-contain" 
                  />
                </div>

                <h2 className={`text-[22px] font-bold ${textColor} mb-8 leading-tight text-left`}>
                  Sua transferência foi concluída
                </h2>

                <div className={`mb-0 text-left`}>
                  <span className={`text-[32px] font-bold ${textColor}`}>
                    R$ {editedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <p className={`text-[15px] ${subTextColor} text-left mb-8`}>
                  Para {isAnonymousMode ? 'Alguém' : capitalizeEachWord(notification.fullName || notification.name)}
                </p>

                <div className={`space-y-0`}>
                  <div className={`flex justify-between items-start py-3 border-b ${borderColor}`}>
                    <span className={`text-[15px] text-white shrink-0`}>Instituição</span>
                    <span className={`text-[15px] font-semibold ${subTextColor} uppercase text-right min-w-0 ml-4`}>{destBankData.bank.toUpperCase()}</span>
                  </div>
                  <div className={`flex justify-between py-3`}>
                    <span className={`text-[15px] text-white`}>Quando</span>
                    <span className={`text-[15px] font-semibold ${subTextColor}`}>Agora</span>
                  </div>
                </div>

                <div className="flex-1" />

                <button 
                  onClick={(e) => { e.stopPropagation(); setIsReceiptOpen(true); }}
                  className="w-full bg-[#820AD1] text-white font-bold text-[16px] py-4 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-[#820AD1]/30"
                >
                  <FileText className="w-5 h-5" />
                  <span>Abrir comprovante</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <NubankReceipt 
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
            notification={notification}
            editedValue={editedValue}
            isAnonymousMode={isAnonymousMode}
            destBank={destBankData.bank}
            destAgency={destBankData.agency}
            destAccount={destBankData.account}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function PinScreen({
  isDarkMode,
  textColor,
  subTextColor,
  onBack,
  onComplete,
}: {
  isDarkMode: boolean;
  textColor: string;
  subTextColor: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [pin, setPin] = useState<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        setPin([]);
        onComplete();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pin, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").split("").slice(0, 4).map(Number);
    setPin(digits);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && pin.length > 0) {
      e.preventDefault();
      setPin((p) => p.slice(0, -1));
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <motion.div
      key="pin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col"
      onClick={handleContainerClick}
    >
      <div className="px-8 pt-12 pb-4">
        <button onClick={(e) => { e.stopPropagation(); onBack(); }} className={`p-2 -ml-2 mb-6 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 5L9 11L14 17" stroke={isDarkMode ? '#ffffff66' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h2 className={`text-[25px] font-bold ${textColor} leading-tight mb-2`}>
          Digite sua senha de 4 dígitos
        </h2>
        <p className={`text-[17px] ${subTextColor} leading-relaxed`}>
          Essa é a mesma senha de 4 dígitos do seu cartão do Nubank
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 pb-10">
        {[0, 1, 2, 3].map((i) => {
          const filled = pin.length > i;
          const isCurrent = pin.length === i;
          let bg: string;
          if (filled) {
            bg = isDarkMode ? '#ffffff' : '#18181b';
          } else if (isCurrent) {
            bg = isDarkMode ? '#a1a1aa' : '#71717a';
          } else {
            bg = isDarkMode ? '#52525b' : '#d4d4d8';
          }
          return (
            <div
              key={i}
              className={`rounded-full ${filled ? 'w-[18px] h-[18px]' : 'w-3 h-3'}`}
              style={{
                backgroundColor: bg,
                forcedColorAdjust: 'none',
                WebkitForcedColorAdjust: 'none',
                colorScheme: 'only light',
              }}
            />
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={pin.join("")}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="fixed opacity-0 pointer-events-none"
        style={{ width: 1, height: 1 }}
        autoFocus
      />
    </motion.div>
  );
}

export default NubankSheet;

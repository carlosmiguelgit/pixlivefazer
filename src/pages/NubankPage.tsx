import { useState, useEffect, useCallback } from 'react';
import { NubankSheet } from '../components/NubankSheet';
import type { Notification } from '../types';

const API = '/api';

export default function NubankPage() {
  const [pendingNotif, setPendingNotif] = useState<{ notification: Notification; dbId: string } | null>(null);
  const [sheetTarget, setSheetTarget] = useState<{ notification: Notification; dbId: string } | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const checkPending = useCallback(async () => {
    try {
      const res = await fetch(`${API}/pending`);
      const data = await res.json();
      if (data.pending) {
        setPendingNotif({ notification: data.notification, dbId: data.dbId });
      } else {
        setPendingNotif(null);
      }
    } catch {
      setPendingNotif(null);
    }
  }, []);

  useEffect(() => {
    checkPending();
    const interval = setInterval(checkPending, 3000);
    return () => clearInterval(interval);
  }, [checkPending]);

  const openSheet = () => {
    if (!pendingNotif) return;
    setSheetTarget(pendingNotif);
    setIsSheetOpen(true);
  };

  const handleConfirm = useCallback(async (_method: 'conta' | 'credito', _editedValue: number) => {
    if (!sheetTarget) return;
    try {
      await fetch(`${API}/process/${sheetTarget.dbId}`, { method: 'POST' });
    } catch {}
    setSheetTarget(null);
    setPendingNotif(null);
  }, [sheetTarget]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-6 pt-12 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img src="/nu.png" alt="Nubank" className="h-8 object-contain" />
          <span className="text-xl font-bold text-[#820AD1]">Nubank</span>
        </div>
      </div>

      <div className="flex-1 px-6 pt-8">
        {pendingNotif ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-500">Transferência pendente</p>
            <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {pendingNotif.notification.fullName || pendingNotif.notification.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    @{pendingNotif.notification.username}
                  </p>
                </div>
                <div className="text-right">
                  {pendingNotif.notification.alerta ? (
                    <>
                      <p className="text-lg font-bold text-yellow-500">REPETIDO</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Não permitido</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-[#820AD1]">
                        R$ {pendingNotif.notification.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Recompensa</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-sm text-slate-500">Chave PIX</span>
                <span className="text-sm font-mono text-slate-700">
                  {pendingNotif.notification.pixKey}
                </span>
              </div>
              {pendingNotif.notification.alerta ? (
                <button
                  onClick={async () => {
                    try { await fetch(`${API}/process-by-id/${pendingNotif.notification.id}`, { method: 'POST' }); } catch {}
                    setPendingNotif(null);
                  }}
                  className="w-full py-3 rounded-full bg-slate-200 text-slate-600 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  FECHAR
                </button>
              ) : (
                <button
                  onClick={openSheet}
                  className="w-full py-3 rounded-full bg-[#820AD1] text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-[#820AD1]/20 flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  NOVA TRANSFERÊNCIA
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="6" width="18" height="12" rx="2"/>
                <circle cx="10" cy="12" r="2"/>
              </svg>
            </div>
            <p className="text-base font-medium text-slate-400">Nenhuma transferência pendente</p>
            <p className="text-sm text-slate-300 mt-1">Aguardando novas notificações...</p>
          </div>
        )}
      </div>

      <NubankSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        notification={sheetTarget?.notification || null}
        nubankBalance={348742.18}
        onConfirm={handleConfirm}
        isAnonymousMode={false}
        isDarkMode={false}
      />
    </div>
  );
}

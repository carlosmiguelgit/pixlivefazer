import React from 'react';
import { History, User, MessageSquare } from 'lucide-react';
import { Notification, Testimonial } from '../types';

interface ExtratoProps {
  confirmedNotifications: Notification[];
  dynamicTestimonials: Testimonial[];
  isAnonymousMode: boolean;
  isDarkMode?: boolean;
}

export const Extrato: React.FC<ExtratoProps> = ({ 
  confirmedNotifications, 
  dynamicTestimonials, 
  isAnonymousMode,
  isDarkMode = true
}) => {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/70' : 'text-slate-400'}`}>Extrato de Inscrições</h4>
        <History className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-slate-300'}`} />
      </div>
      
      <div className="space-y-3">
        {confirmedNotifications.length === 0 ? (
          <div className={`glass rounded-2xl p-8 text-center ${isDarkMode ? '' : 'bg-black/5'}`}>
            <p className={`${isDarkMode ? 'text-white/60' : 'text-slate-400'} text-sm`}>Nenhuma inscrição confirmada ainda.</p>
          </div>
        ) : (
          confirmedNotifications.map((notif) => {
            const hasTestimonial = dynamicTestimonials.some(t => t.name === notif.name);
            
            return (
              <div 
                key={notif.id} 
                className={`glass rounded-2xl p-4 flex items-center justify-between transition-all ${
                  hasTestimonial 
                    ? (isDarkMode ? 'border-brand-red/30 bg-white/[0.08]' : 'border-brand-red/30 bg-black/[0.02]') 
                    : (isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-black/[0.02] border-black/5')
                } ${hasTestimonial ? 'cursor-pointer active:scale-[0.98]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border ${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-black/5 border-black/10'}`}>
                    {isAnonymousMode ? (
                      <User className={`w-5 h-5 ${isDarkMode ? 'text-white/70' : 'text-slate-400'}`} />
                    ) : (
                      <img src={notif.photo} alt={notif.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {isAnonymousMode ? 'Alguém' : notif.name}
                      </p>
                      {hasTestimonial && !isAnonymousMode && (
                        <MessageSquare className="w-3 h-3 text-brand-red animate-pulse" />
                      )}
                    </div>
                    {!isAnonymousMode && (
                      <p className={`text-[9px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                        @{notif.username}
                      </p>
                    )}
                    <p className={`text-[10px] uppercase ${isDarkMode ? 'text-white/60' : 'text-slate-400'}`}>
                      {notif.contributionAmount} PARTICIPAÇÃO • {notif.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-red">{notif.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
                  <p className={`text-[8px] uppercase tracking-widest ${isDarkMode ? 'text-white/40' : 'text-slate-300'}`}>Liberado</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

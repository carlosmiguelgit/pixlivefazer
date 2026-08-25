import React from 'react';
import { Trophy, User, Star } from 'lucide-react';
import { Notification } from '../types';

interface RankingProps {
  confirmedNotifications: Notification[];
  isAnonymousMode: boolean;
  isDarkMode?: boolean;
}

export const Ranking: React.FC<RankingProps> = ({ 
  confirmedNotifications, 
  isAnonymousMode,
  isDarkMode = true,
}) => {
  const getMedal = (index: number) => {
    switch(index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return null;
    }
  };

  const sortedRanking = [...confirmedNotifications].sort((a, b) => b.months - a.months);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white/70' : 'text-slate-400'}`}>Ranking de Membros</h4>
        <Trophy className={`w-4 h-4 ${isDarkMode ? 'text-white/50' : 'text-slate-300'}`} />
      </div>
      
      <div className="space-y-3">
        {sortedRanking.length === 0 ? (
          <div className={`border rounded-2xl p-8 text-center ${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-black/5 border-black/5'}`}>
            <p className={`${isDarkMode ? 'text-white/60' : 'text-slate-400'} text-sm`}>O ranking será atualizado conforme você liberar as inscrições.</p>
          </div>
        ) : (
          sortedRanking
            .slice(0, 10)
            .map((m, i) => {
              const medal = getMedal(i);
              
              return (
                <div 
                  key={m.id} 
                  className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${
                    isDarkMode ? 'bg-white/[0.05] border-white/10' : 'bg-black/[0.02] border-black/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                      {medal ? (
                        <span className="text-lg leading-none">{medal}</span>
                      ) : (
                        <span className={`${isDarkMode ? 'text-white/70' : 'text-slate-400'} text-xs`}>{i + 1}</span>
                      )}
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border ${isDarkMode ? 'bg-white/5 border-white/20' : 'bg-black/5 border-black/10'}`}>
                      {isAnonymousMode ? (
                        <User className={`w-5 h-5 ${isDarkMode ? 'text-white/80' : 'text-slate-400'}`} />
                      ) : (
                        <img src={m.photo} alt={m.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {isAnonymousMode ? 'Alguém' : m.name}
                      </p>
                      {!isAnonymousMode && (
                        <p className={`text-[9px] ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
                          @{m.username}
                        </p>
                      )}
                      <p className={`text-[10px] uppercase tracking-wider font-bold ${isDarkMode ? 'text-brand-red' : 'text-brand-red'}`}>
                        {m.contributionAmount} PARTICIPAÇÃO • SUPER-FÃ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-brand-red">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[10px] font-bold uppercase">Destaque</span>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

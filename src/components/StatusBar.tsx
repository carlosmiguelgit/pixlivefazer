import React, { useState, useEffect } from 'react';
import { Signal, Wifi } from 'lucide-react';

interface StatusBarProps {
  onBatteryClick: () => void;
  isDarkMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  onBatteryClick, 
  isDarkMode
}) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="relative z-30 px-6 pt-4 pb-0 flex justify-between items-start tracking-tight">
      <div className="flex items-center mt-1.5">
        <span className={`text-xs font-medium tabular-nums ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>
          {formattedTime}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <div className={`flex items-center gap-1.5 mt-1 ${isDarkMode ? 'text-white/50' : 'text-slate-400'}`}>
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <div 
            className="flex items-center gap-0.5 cursor-pointer active:scale-95 transition-transform"
            onClick={onBatteryClick}
          >
            <div className={`w-5 h-2.5 border rounded-[3px] p-[1px] flex items-center ${isDarkMode ? 'border-white/30' : 'border-black/20'}`}>
              <div className={`h-full w-[80%] rounded-[1px] ${isDarkMode ? 'bg-white/60' : 'bg-slate-500'}`} />
            </div>
            <div className={`w-0.5 h-1 rounded-r-full ${isDarkMode ? 'bg-white/30' : 'bg-black/20'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
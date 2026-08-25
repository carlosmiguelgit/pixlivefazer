import React from 'react';

interface BottomNavProps {
  activeTab: 'inbox' | 'dash' | 'extrato' | 'ranking';
  setActiveTab: (tab: 'inbox' | 'dash' | 'extrato' | 'ranking') => void;
  isDarkMode?: boolean;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isDarkMode = true, unreadCount = 0 }) => {
  return (
    <nav data-nav className="relative z-20 h-[52px] border-t border-white/10 flex items-center justify-around px-2 bg-[#000000]">
      <button 
        onClick={() => setActiveTab('inbox')}
        className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === 'inbox' ? 'text-white' : 'text-white/50'}`}
      >
        <img src="/inicio.png" alt="Início" className="h-[45px] w-auto object-contain" />
      </button>

      <button 
        onClick={() => setActiveTab('dash')}
        className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === 'dash' ? 'text-white' : 'text-white/50'}`}
      >
        <img src="/amigos.png" alt="Amigos" className="h-[45px] w-auto object-contain" />
      </button>

      <button 
        className="flex items-center justify-center flex-1 py-1"
      >
        <img src="/mais.png" alt="Adicionar" className="h-[45px] w-auto object-contain" />
      </button>

      <button 
        className="flex flex-col items-center justify-center flex-1 py-1 relative text-white"
      >
        <div className="relative">
          <img src="/mensagem.png" alt="Mensagens" className="h-[45px] w-auto object-contain translate-x-[5px]" />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 -translate-x-[5px] min-w-[16px] h-4 rounded-full bg-[#fe2c55] flex items-center justify-center px-1">
              <span className="text-[10px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
            </div>
          )}
        </div>
      </button>

      <button 
        onClick={() => setActiveTab('extrato')}
        className={`flex flex-col items-center justify-center flex-1 py-1 ${activeTab === 'extrato' ? 'text-white' : 'text-white/50'}`}
      >
        <img src="/perfil.png" alt="Perfil" className="h-[45px] w-auto object-contain" />
      </button>
    </nav>
  );
};

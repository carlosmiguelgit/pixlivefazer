import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import { Notification } from '../types';

interface MessageInboxProps {
  notifications: Notification[];
  isDarkMode: boolean;
  isAnonymousMode: boolean;
  onOpenChat: (notif: Notification) => void;
}

const SUGGESTED_ACCOUNTS = [
  { username: 'pedro.silva92', subtitle: 'Segue você', avatar: '/avatar/@pedro.silva92.png' },
  { username: 'rafael.oliveira', subtitle: 'Sugestões para você', avatar: '/avatar/@rafael.oliveira.png' },
];

export const MessageInbox: React.FC<MessageInboxProps> = ({
  notifications,
  isDarkMode,
  isAnonymousMode,
  onOpenChat,
}) => {
  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const getMessagePreview = (notif: Notification): string => {
    if (isAnonymousMode) return 'Nova mensagem';
    return notif.lastMessage || notif.initialMessage || 'Diga olá para ' + notif.username;
  };

  return (
    <div className="flex flex-col h-full bg-[#000000]">
      {/* ===== HEADER ===== */}
      <div className="px-4 pt-1 pb-2 flex items-center justify-between shrink-0">
        <button className="p-1">
          <img src="/chat (1).png" alt="" className="w-[25px] h-[25px]" />
        </button>
        <div className="flex items-center gap-1.5">
          <h1 className="text-[17px] font-bold text-white">Mensagens</h1>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <Search className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* ===== BANNER ===== */}
        <div className="mx-3 mb-6 bg-[#1a1a1a] rounded-xl px-3 py-2 flex items-center gap-2">
          <div className="flex items-center shrink-0">
            <img src="/chat (2).png" alt="" className="w-[38px] h-[38px] object-contain" />
          </div>
          <p className="text-[12px] text-white/80 flex-1 leading-[1.35] min-w-0">
            Criar um Animal da<br />Sequência juntos! Convide...
          </p>
          <button className="bg-[#fe2c55] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shrink-0 whitespace-nowrap">
            Envie um convite
          </button>
          <button className="text-white/40 shrink-0 ml-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ===== STORIES ROW ===== */}
        <div className="flex items-start gap-5 px-4 mb-4 mt-[50px] relative">
          {/* Criar - user avatar with speech bubble */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer">
            <div className="w-[68px] h-[68px] relative active:scale-95 transition-transform">
              {/* Speech bubble "Café ou chá?" */}
              <div className="absolute -top-[30px] left-0 z-10">
                <div className="bg-[#2a2a2a] text-white text-[11px] font-medium px-2 py-1 rounded-lg whitespace-nowrap relative leading-tight">
                  Café ou<br />chá?
                  <div className="absolute -bottom-[5px] left-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#2a2a2a]" />
                </div>
              </div>
              {/* Avatar without gradient ring */}
              <div className="w-[68px] h-[68px] rounded-full overflow-hidden">
                <img
                  src="https://i.ibb.co/ns0t1D5p/aqui.png"
                  alt="Criar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Cyan + badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-[#25f4ee] flex items-center justify-center border-[2.5px] border-[#000000]">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <span className="text-[11px] text-white/70">Criar</span>
          </div>

          {/* + Widget */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-[68px] h-[68px]">
              <img src="/chat (3).png" alt="" className="w-full h-full object-contain" />
            </div>
            <span className="text-[11px] text-white/70">+ Widget</span>
          </div>
        </div>

        {/* ===== ATIVIDADE ===== */}
        <div className="pl-[7px] pr-4 py-2 flex items-center gap-3">
          <div className="w-[54px] h-[54px] shrink-0">
            <img src="/raio@2x.png" alt="" className="w-[54px] h-[54px] object-cover rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-white leading-tight">Atividade e novos seguidores</p>
            <p className="text-[13px] text-white/50 truncate mt-0.5">Dicas da Mel 🐵 curtiu seu comentário.</p>
          </div>
        </div>

        {/* ===== NOTIFICAÇÕES DO SISTEMA ===== */}
        <div className="pl-[7px] pr-4 py-0.5 flex items-center gap-3">
          <div className="w-[54px] h-[54px] shrink-0">
            <img src="/notif@2x.png" alt="" className="w-[54px] h-[54px] object-cover rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-white leading-tight">Notificações do sistema</p>
            <p className="text-[13px] text-white/50 truncate mt-0.5">LIVE: Sua LIVE te espera 🎬 · 7h</p>
          </div>
        </div>

        {/* ===== CHAT MESSAGES FROM USERS ===== */}
        <AnimatePresence initial={false}>
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className="pl-[8px] pr-4 py-3 flex items-center gap-3 active:bg-white/5 transition-colors cursor-pointer"
              data-chat-card
              onClick={() => onOpenChat(notif)}
            >
              <div className="relative shrink-0">
                <div className="w-[54px] h-[54px] rounded-full overflow-hidden bg-[#2a2a2a]">
                  {isAnonymousMode ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/20" />
                    </div>
                  ) : (
                    <img
                      src={notif.photo}
                      alt={notif.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-[2px] border-black" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-white leading-tight truncate">
                  {isAnonymousMode ? 'Alguém' : notif.name}
                </p>
                <p className="text-[13px] text-white/50 truncate mt-0.5">
                  {getMessagePreview(notif)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[12px] text-white/40">
                  {formatTimeAgo(notif.timestamp)}
                </span>
                {!notif.lastMessage && <div className="w-2.5 h-2.5 rounded-full bg-[#fe2c55]" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ===== CONTAS SUGERIDAS ===== */}
        <div className="mt-8">
          <div className="px-4 pb-3 flex items-center gap-2">
            <h3 className="text-[16px] font-bold text-white">Contas sugeridas</h3>
            <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
              <span className="text-[10px] text-white/50 font-medium">i</span>
            </div>
          </div>

          {SUGGESTED_ACCOUNTS.map((account, idx) => (
            <div key={idx} className="px-4 py-3 flex items-center gap-3">
              <div className="w-[54px] h-[54px] rounded-full overflow-hidden shrink-0 bg-[#2a2a2a]">
                <img src={account.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-white leading-tight">{account.username}</p>
                <p className="text-[12px] text-white/50 mt-0.5">{account.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="bg-[#fe2c55] text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  Seguir de volta
                </button>
                <button className="text-white/40 p-1">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};

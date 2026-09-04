import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Notification } from "../types";
import { RESPOSTAS_AGENUARDAR, RESPOSTAS_REPETIDO_AGRADECIMENTO } from "../constants";

interface PrivateChatProps {
  username: string;
  nickname: string;
  fullName?: string;
  avatar: string;
  followingCount?: number;
  followerCount?: number;
  pixKey?: string;
  initialMessage?: string;
  onComplete: (name: string, pixKey: string) => void;
  onBack: () => void;
  onBotMessage?: (text: string) => void;
  fraseAgradecimento?: string;
  fraseConfirmacao?: string;
  modoMeses?: boolean;
  notification?: Notification | null;
  onOpenNubank?: (notification: Notification) => void;
  historyMessages?: { text: string; sender: 'me' | 'them'; timestamp?: number; showVisto?: boolean; isTyping?: boolean }[];
  onHistoryUpdate?: (messages: { text: string; sender: 'me' | 'them'; timestamp?: number; showVisto?: boolean; isTyping?: boolean }[]) => void;
  nubankCompleted?: boolean;
  onFlowEnd?: () => void;
  hideDateTime?: boolean;
  onScheduleBotResponse?: (notifId: string, texto: string, delayMs: number) => void;
}

export default function PrivateChat({ username, nickname, fullName, avatar, followingCount, followerCount, pixKey, initialMessage, onComplete, onBack, onBotMessage, fraseAgradecimento, fraseConfirmacao, modoMeses, notification, onOpenNubank, historyMessages, onHistoryUpdate, nubankCompleted, onFlowEnd, hideDateTime = false, onScheduleBotResponse }: PrivateChatProps) {
  const [messages, setMessages] = useState<{ text: string; sender: 'me' | 'them'; timestamp: number; showVisto?: boolean; isTyping?: boolean }[]>(
    historyMessages && historyMessages.length > 0
      ? historyMessages.map((m, i) => ({ ...m, timestamp: m.timestamp || Date.now() - (historyMessages.length - i) * 60000 }))
      : initialMessage ? [{ text: initialMessage, sender: 'them', timestamp: Date.now() }] : []
  );
  const [inputText, setInputText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agradFallbackIdxRef = useRef(0);
  const [showVisto, setShowVisto] = useState(false);
  const [agradecimentoEnviado, setAgradecimentoEnviado] = useState(false);
  const [isTyping, setIsTyping] = useState(() => {
    if (historyMessages && historyMessages.length > 0) {
      const lastMsg = historyMessages[historyMessages.length - 1];
      if (lastMsg.sender === 'me') return true;
    }
    return false;
  });
  const [isOnline, setIsOnline] = useState(() => {
    if (notification?.timestamp) {
      return Date.now() - new Date(notification.timestamp).getTime() < 120000;
    }
    return true;
  });

  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!notification?.timestamp) return;
    const update = () => {
      const elapsed = Date.now() - new Date(notification.timestamp).getTime();
      if (elapsed < 120000) {
        setIsOnline(true);
        setTimeAgo('');
      } else {
        setIsOnline(false);
        const mins = Math.floor(elapsed / 60000);
        if (mins < 60) setTimeAgo(`Ativo há ${mins} min`);
        else {
          const hours = Math.floor(mins / 60);
          setTimeAgo(`Ativo há ${hours}h`);
        }
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [notification?.timestamp]);

  const hasHistory = !!(historyMessages && historyMessages.length > 0);
  const hasUserMsgInHistory = hasHistory && historyMessages!.some(m => m.sender === 'me');
  const hasConfirmMsgInHistory = hasHistory && historyMessages!.some(m => m.sender === 'them' && fraseConfirmacao && m.text === fraseConfirmacao);
  const hasAgradMsgInHistory = hasHistory && historyMessages!.some(m => m.sender === 'them' && fraseAgradecimento && m.text === fraseAgradecimento);

  const formatMsgTimeAgo = (timestamp?: number): string => {
    if (!timestamp) return '';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return '';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const respondeuRef = useRef(hasUserMsgInHistory);
  const confirmacaoEnviadaRef = useRef(hasConfirmMsgInHistory);
  const faseRef = useRef<'idle' | 'confirmacao' | 'agradecimento'>(
    hasAgradMsgInHistory ? 'agradecimento' : hasConfirmMsgInHistory ? 'agradecimento' : hasUserMsgInHistory ? 'confirmacao' : 'idle'
  );

  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      const lastMsg = historyMessages[historyMessages.length - 1];
      if (lastMsg.sender === 'them') {
        setIsTyping(false);
        setShowVisto(false);
      }

      const hasUserMsg = historyMessages.some(m => m.sender === 'me');
      const hasBotConfirmacao = historyMessages.some(m => m.sender === 'them' && fraseConfirmacao && m.text === fraseConfirmacao);
      const hasBotAgradecimento = historyMessages.some(m => m.sender === 'them' && fraseAgradecimento && m.text === fraseAgradecimento);

      respondeuRef.current = hasUserMsg || respondeuRef.current;
      if (hasBotConfirmacao) {
        confirmacaoEnviadaRef.current = true;
        faseRef.current = 'agradecimento';
      }
      if (hasBotAgradecimento) {
        setAgradecimentoEnviado(true);
        faseRef.current = 'agradecimento';
      }
    }
  }, [historyMessages, fraseAgradecimento, fraseConfirmacao]);

  function enviarRespostaBot(texto: string, onComplete?: () => void) {
    setShowVisto(true);
    const isRepetido = !!notification?.alerta;
    const baseDelay = isRepetido ? 9000 : 5000;
    const randomDelay = 3000;
    const typingStart = isRepetido ? 4000 + Math.random() * 2000 : 3000 + Math.random() * 2000;
    const totalDelay = typingStart + 1000 + baseDelay + Math.random() * randomDelay;

    if (notification?.id && onScheduleBotResponse) {
      onScheduleBotResponse(notification.id, texto, totalDelay);
    }

    timerRef.current = setTimeout(() => {
      setIsTyping(true);
      timerRef.current = setTimeout(() => {
        setShowVisto(false);
        setIsTyping(false);
        setMessages((prev) => {
          if (prev.some(m => m.text === texto && m.sender === 'them')) return prev;
          return [...prev, { text: texto, sender: 'them', timestamp: Date.now() }];
        });
        onBotMessage?.(texto);
        onComplete?.();
      }, totalDelay - typingStart);
    }, typingStart);
  }

  function gerarAgradecimento() {
    const isRepetido = !!notification?.alerta;
    let texto = fraseAgradecimento;
    if (!texto && notification) {
      const genero = notification.gender;
      const pool = isRepetido
        ? RESPOSTAS_REPETIDO_AGRADECIMENTO.filter(r => r.genero === genero)
        : RESPOSTAS_AGENUARDAR.filter(r => r.faixa === (notification.contributionAmount <= 90 ? 'baixa' : 'alta') && r.genero === genero);
      texto = pool[agradFallbackIdxRef.current % pool.length].texto || "obrigado";
      agradFallbackIdxRef.current = (agradFallbackIdxRef.current + 1) % pool.length;
    }
    texto = texto || "obrigado";
    enviarRespostaBot(texto, () => {
      setAgradecimentoEnviado(true);
      onFlowEnd?.();
    });
  }

  function gerarConfirmacao() {
    const texto = fraseConfirmacao || "obrigado";
    enviarRespostaBot(texto, () => {
      confirmacaoEnviadaRef.current = true;
      faseRef.current = 'agradecimento';
    });
  }

  function formatTime(ts: number) {
    const d = new Date(ts);
    return `Hoje ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;

    const lastHistMsg = historyMessages && historyMessages.length > 0 ? historyMessages[historyMessages.length - 1] : null;
    const botAlreadyScheduled = lastHistMsg?.sender === 'me';

    const isRepetido = !!notification?.alerta;

    if (!respondeuRef.current) {
      respondeuRef.current = true;
      const newMessages = [...messages, { text, sender: 'me' as const, timestamp: Date.now() }];
      setMessages(newMessages);
      setInputText("");
      if (onHistoryUpdate) onHistoryUpdate(newMessages);
      if (isRepetido) {
        gerarAgradecimento();
      } else {
        faseRef.current = 'confirmacao';
        gerarConfirmacao();
      }
    } else if (botAlreadyScheduled) {
      const newMessages = [...messages, { text, sender: 'me' as const, timestamp: Date.now() }];
      setMessages(newMessages);
      setInputText("");
      return;
    } else if (confirmacaoEnviadaRef.current && !agradecimentoEnviado) {
      const newMessages = [...messages, { text, sender: 'me' as const, timestamp: Date.now() }];
      setMessages(newMessages);
      setInputText("");
      if (onHistoryUpdate) onHistoryUpdate(newMessages);
      gerarAgradecimento();
    }
  }

  useEffect(() => {
    if (onHistoryUpdate && messages.length > 0) {
      onHistoryUpdate(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (historyMessages && historyMessages.length > messages.length) {
      setMessages(historyMessages.map((m, i) => ({ ...m, timestamp: m.timestamp || Date.now() - (historyMessages.length - i) * 60000 })));
    }
  }, [historyMessages]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 pt-[50px] pb-2.5 bg-[#0a0a0a] shrink-0">
        <button onClick={onBack} className="p-1 -ml-1 text-white shrink-0">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-white">
            <path d="M14 5L9 11L14 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="w-[30px] h-[30px] rounded-full bg-zinc-700 overflow-hidden shrink-0 border border-zinc-600">
          <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="flex flex-col -mt-[10px]">
          <span className="text-[18px] font-semibold text-white truncate leading-tight">{nickname}</span>
          <span className="text-[14px] text-zinc-400 leading-tight">{isOnline ? 'Ativo agora' : timeAgo}</span>
        </div>
        <div className="flex-1" />
        <button className="flex items-center gap-[3px] shrink-0 pr-1">
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-400" />
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-400" />
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-400" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-[52px] pb-6 shrink-0 bg-[#0a0a0a]">
        <div className="w-[76px] h-[76px] rounded-full bg-zinc-700 overflow-hidden border-2 border-zinc-600 mb-3 shrink-0">
          <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <span className="text-[24px] font-bold text-white mb-1">{nickname}</span>
        <span className="text-[14px] text-zinc-400 mb-0.5">@{username}</span>
        {followingCount !== undefined && followerCount !== undefined && (
          <span className="text-[14px] text-zinc-500 mb-2">{followingCount.toLocaleString('pt-BR')} seguindo · {followerCount.toLocaleString('pt-BR')} seguidores</span>
        )}

      </div>

      <div className="flex-1 bg-[#0a0a0a] overflow-y-auto px-4 py-2 flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-1">
            {i === 0 && !hideDateTime && <span className="text-center text-[11px] text-zinc-500 leading-none mt-1">{formatTime(msg.timestamp)}</span>}
            {msg.sender === 'me' ? (
              <div className="flex flex-col items-end gap-1">
                <div className="bg-[#7c3aed] text-white text-[14px] px-3 py-2 rounded-[18px] max-w-[280px] leading-snug break-words">{msg.text}</div>
                {showVisto && i === messages.length - 1 && <span className="text-[10px] text-zinc-500 leading-none pr-1">Visto</span>}
              </div>
            ) : (
              <div className="flex items-end gap-2 select-none">
                <div className="w-[28px] h-[28px] rounded-full bg-zinc-700 overflow-hidden shrink-0 border border-zinc-600">
                  <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="bg-[#2a2a2a] text-white text-[14px] px-3 py-2 rounded-[18px] max-w-[280px] leading-snug break-words whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-end gap-2 select-none">
            <div className="w-[28px] h-[28px] rounded-full bg-zinc-700 overflow-hidden shrink-0 border border-zinc-600">
              <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="bg-[#2a2a2a] px-4 py-3 rounded-[18px] flex items-center gap-1.5">
              <motion.span
                animate={{ y: [0, -4, 0, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, times: [0, 0.2, 0.4, 1], ease: "easeInOut" }}
                className="w-[6px] h-[6px] bg-zinc-400 rounded-full opacity-100"
              />
              <motion.span
                animate={{ y: [0, -4, 0, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, times: [0, 0.2, 0.4, 1], ease: "easeInOut", delay: 0.15 }}
                className="w-[6px] h-[6px] bg-zinc-400 rounded-full opacity-75"
              />
              <motion.span
                animate={{ y: [0, -4, 0, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, times: [0, 0.2, 0.4, 1], ease: "easeInOut", delay: 0.3 }}
                className="w-[6px] h-[6px] bg-zinc-400 rounded-full opacity-55"
              />
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 pb-3 pt-1.5">
        <div className="bg-[#1a1a1a] rounded-full flex items-center gap-2 px-3.5 py-2.5">
          <button className="shrink-0 w-[17px] h-[15px]">
            <img src="/camera.png" alt="" className="w-full h-full object-contain" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Mensagem..."
            className="text-[16px] text-white flex-1 bg-transparent outline-none placeholder-zinc-500 pl-2"
          />
          <button
            type="button"
            onClick={() => {
              if (!nubankCompleted && notification && onOpenNubank) {
                onOpenNubank(notification);
              }
            }}
            className="cursor-pointer"
          >
            <img src="/d.png" alt="" className="w-[22px] h-[22px] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

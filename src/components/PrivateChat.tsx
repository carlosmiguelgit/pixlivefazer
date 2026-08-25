import { useState, useRef, useEffect } from "react";
import { Notification } from "../types";

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
  fraseEspera?: string;
  fraseAgradecimento?: string;
  notification?: Notification | null;
  onOpenNubank?: (notification: Notification) => void;
  historyMessages?: { text: string; sender: 'me' | 'them'; timestamp?: number }[];
  onHistoryUpdate?: (messages: { text: string; sender: 'me' | 'them'; timestamp?: number }[]) => void;
  nubankCompleted?: boolean;
}

export default function PrivateChat({ username, nickname, fullName, avatar, followingCount, followerCount, pixKey, initialMessage, onComplete, onBack, onBotMessage, fraseEspera, fraseAgradecimento, notification, onOpenNubank, historyMessages, onHistoryUpdate, nubankCompleted }: PrivateChatProps) {
  const [messages, setMessages] = useState<{ text: string; sender: 'me' | 'them'; timestamp: number }[]>(
    historyMessages && historyMessages.length > 0
      ? historyMessages.map((m, i) => ({ ...m, timestamp: m.timestamp || Date.now() - (historyMessages.length - i) * 60000 }))
      : initialMessage ? [{ text: initialMessage, sender: 'them', timestamp: Date.now() }] : []
  );
  const [inputText, setInputText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showVisto, setShowVisto] = useState(false);
  const [agradecimentoEnviado, setAgradecimentoEnviado] = useState(false);

  const respondeuRef = useRef(historyMessages ? historyMessages.filter(m => m.sender === 'me').length > 0 : false);
  const agradeceuRef = useRef(historyMessages ? historyMessages.filter(m => m.sender === 'me').length > 1 : false);
  const finalizouRef = useRef(false);

  useEffect(() => {
    if (historyMessages && historyMessages.length > 0) {
      const lastBotMsg = [...historyMessages].reverse().find(m => m.sender === 'them');
      if (lastBotMsg && fraseAgradecimento && lastBotMsg.text === fraseAgradecimento) {
        setAgradecimentoEnviado(true);
      }
    }
  }, [historyMessages, fraseAgradecimento]);

  function agendarRespostaEspera() {
    const texto = fraseEspera || "ok, to esperando";
    setShowVisto(true);
    const delayResponse = texto.length > 80 ? 18000 + Math.random() * 5000 : 8000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setShowVisto(false);
      setMessages((prev) => [...prev, { text: texto, sender: 'them', timestamp: Date.now() }]);
      onBotMessage?.(texto);
    }, delayResponse);
  }

  function gerarAgradecimento() {
    const texto = fraseAgradecimento || "obrigado";
    setShowVisto(true);
    const delayResponse = texto.length > 80 ? 18000 + Math.random() * 5000 : 8000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setShowVisto(false);
      setMessages((prev) => [...prev, { text: texto, sender: 'them', timestamp: Date.now() }]);
      setAgradecimentoEnviado(true);
      onBotMessage?.(texto);
    }, delayResponse);
  }

  function gerarRespostaFinal() {
    const frases = [
      "beleza, valeu demais guilherme",
      "muito obrigado guilherme, de coração",
      "isso, tmj guilherme",
      "show, obrigado pela ajuda",
      "perfeito, valeu guilherme"
    ];
    const texto = frases[Math.floor(Math.random() * frases.length)];
    setShowVisto(true);
    const delayResponse = 6000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setShowVisto(false);
      setMessages((prev) => [...prev, { text: texto, sender: 'them', timestamp: Date.now() }]);
      onBotMessage?.(texto);
      setTimeout(() => {
        if (notification) {
          onComplete(notification.name, notification.pixKey);
        }
      }, 1000);
    }, delayResponse);
  }

  function formatTime(ts: number) {
    const d = new Date(ts);
    return `Hoje ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text) return;
    const newMessages = [...messages, { text, sender: 'me' as const, timestamp: Date.now() }];
    setMessages(newMessages);
    setInputText("");
    if (onHistoryUpdate) {
      onHistoryUpdate(newMessages);
    }

    const isRepetido = !!notification?.alerta;

    if (isRepetido) {
      if (!respondeuRef.current) {
        respondeuRef.current = true;
        gerarAgradecimento();
      }
    } else {
      if (!respondeuRef.current) {
        respondeuRef.current = true;
        agendarRespostaEspera();
      } else if (!agradeceuRef.current) {
        agradeceuRef.current = true;
        gerarAgradecimento();
      } else if (!finalizouRef.current) {
        finalizouRef.current = true;
        gerarRespostaFinal();
      }
    }
  }

  useEffect(() => {
    if (onHistoryUpdate && messages.length > 0) {
      onHistoryUpdate(messages);
    }
  }, [messages]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white text-black overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 h-[54px] pt-2.5 bg-white shrink-0 min-h-[54px]">
        <button onClick={onBack} className="p-1 -ml-1 text-zinc-800 shrink-0">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-zinc-800">
            <path d="M14 5L9 11L14 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="w-[30px] h-[30px] rounded-full bg-zinc-200 overflow-hidden shrink-0 border border-zinc-300">
          <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <span className="text-[18px] font-semibold text-black truncate leading-tight">{nickname}</span>
        <div className="flex-1" />
        <button className="flex items-center gap-[3px] shrink-0 pr-1">
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-700" />
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-700" />
          <span className="w-[4px] h-[4px] rounded-full bg-zinc-700" />
        </button>
      </div>

      <div className="flex flex-col items-center pt-[52px] pb-6 shrink-0 bg-white">
        <div className="w-[76px] h-[76px] rounded-full bg-zinc-200 overflow-hidden border-2 border-white mb-3 shrink-0">
          <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <span className="text-[24px] font-bold text-black mb-1">{nickname}</span>
        <span className="text-[14px] text-[#555] mb-0.5">@{username}</span>
        {followingCount !== undefined && followerCount !== undefined && (
          <span className="text-[14px] text-zinc-500 mb-2">{followingCount.toLocaleString('pt-BR')} seguindo · {followerCount.toLocaleString('pt-BR')} seguidores</span>
        )}
        <button className="bg-[#ed4956] text-white text-[18px] font-bold px-12 py-[0.35rem] rounded-full">Seguir</button>
      </div>

      <div className="flex-1 bg-white overflow-y-auto px-4 py-2 flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-center text-[11px] text-zinc-400 leading-none mt-1">{formatTime(msg.timestamp)}</span>
            {msg.sender === 'me' ? (
              <div className="flex flex-col items-end gap-1">
                <div className="bg-[#4f6ef7] text-white text-[14px] px-3 py-2 rounded-[18px] max-w-[280px] leading-snug break-words">{msg.text}</div>
                {showVisto && i === messages.length - 1 && <span className="text-[10px] text-zinc-400 leading-none pr-1">Visto</span>}
              </div>
            ) : (
              <div className="flex items-end gap-2 select-none">
                <div className="w-[28px] h-[28px] rounded-full bg-zinc-200 overflow-hidden shrink-0 border border-zinc-300">
                  <img src={avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="bg-[#D4D4D4] text-black text-[14px] px-3 py-2 rounded-[18px] max-w-[280px] leading-snug break-words whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="shrink-0 px-3 pb-3 pt-1.5">
        <div className="bg-[#eeeeee] rounded-full flex items-center gap-2 px-3.5 py-2.5">
          <button className="shrink-0 w-[17px] h-[15px]">
            <svg viewBox="0 0 38 30" className="w-full h-full">
              <rect x="2" y="6" width="34" height="22" rx="4" fill="black" />
              <rect x="27" y="4" width="6" height="4" rx="1" fill="black" />
              <circle cx="19" cy="16" r="6" fill="white" />
              <circle cx="19" cy="16" r="3.5" fill="black" />
            </svg>
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Mensagem..."
            className="text-[16px] text-black flex-1 bg-transparent outline-none placeholder-zinc-500 pl-2"
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
